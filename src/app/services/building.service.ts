import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { IBuilding } from '../models/building.model';
import { GameDataService } from './game-data.service';
import { WorldService } from './world.service';
import { InventoryService } from './inventory.service';
import { AudioService } from './audio.service';

export interface BuildingType {
  id: string;
  name: string;
  emoji: string;
  size: { width: number, height: number };
  cost: { wood?: number, stone?: number };
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class BuildingService {
  private buildings: IBuilding[] = [];
  private buildings$ = new BehaviorSubject<IBuilding[]>(this.buildings);
  private buildingTypes: Map<string, BuildingType> = new Map();
  private nextBuildingId = 1;

  constructor(
    private gameDataService: GameDataService,
    private worldService: WorldService,
    private inventoryService: InventoryService,
    private audioService: AudioService
  ) {
    this.initializeBuildingTypes();
    
    this.gameDataService.getGameState().subscribe(state => {
      if (state.buildings) {
        this.buildings = state.buildings;
        this.buildings$.next(this.buildings);
      }
    });
  }

  private initializeBuildingTypes(): void {
    const types: BuildingType[] = [
      {
        id: 'house',
        name: '小屋',
        emoji: '🏠',
        size: { width: 2, height: 2 },
        cost: { wood: 10, stone: 5 },
        description: '一个舒适的小屋'
      },
      {
        id: 'storage',
        name: '仓库',
        emoji: '🏪',
        size: { width: 2, height: 2 },
        cost: { wood: 5, stone: 3 },
        description: '存储物品的仓库'
      },
      {
        id: 'well',
        name: '水井',
        emoji: '⛲',
        size: { width: 1, height: 1 },
        cost: { stone: 5 },
        description: '提供水源的井'
      },
      {
        id: 'fence',
        name: '栅栏',
        emoji: '🚧',
        size: { width: 1, height: 1 },
        cost: { wood: 1 },
        description: '装饰用的栅栏'
      }
    ];

    types.forEach(type => {
      this.buildingTypes.set(type.id, type);
    });
  }

  getBuildings(): Observable<IBuilding[]> {
    return this.buildings$.asObservable();
  }

  getBuildingTypes(): BuildingType[] {
    return Array.from(this.buildingTypes.values());
  }

  canAffordBuilding(typeId: string): boolean {
    const type = this.buildingTypes.get(typeId);
    if (!type) return false;

    const inventory = this.inventoryService['inventory'];
    const woodSlot = inventory.find(s => s.item?.id === 'wood');
    const stoneSlot = inventory.find(s => s.item?.id === 'stone');

    const hasWood = !type.cost.wood || (woodSlot !== undefined && woodSlot.quantity >= type.cost.wood);
    const hasStone = !type.cost.stone || (stoneSlot !== undefined && stoneSlot.quantity >= type.cost.stone);

    return !!(hasWood && hasStone);
  }

  canPlaceBuilding(typeId: string, x: number, y: number): boolean {
    const type = this.buildingTypes.get(typeId);
    if (!type) return false;

    // Check if all tiles are available
    for (let dx = 0; dx < type.size.width; dx++) {
      for (let dy = 0; dy < type.size.height; dy++) {
        const tile = this.worldService.getTile(x + dx, y + dy);
        if (!tile || tile.type === 'water' || tile.buildingId || tile.crop) {
          return false;
        }
      }
    }

    return true;
  }

  placeBuilding(typeId: string, x: number, y: number): boolean {
    if (!this.canAffordBuilding(typeId) || !this.canPlaceBuilding(typeId, x, y)) {
      return false;
    }

    const type = this.buildingTypes.get(typeId);
    if (!type) return false;

    // Deduct resources
    const inventory = this.inventoryService['inventory'];
    if (type.cost.wood) {
      const woodIndex = inventory.findIndex(s => s.item?.id === 'wood');
      if (woodIndex >= 0) {
        this.inventoryService.removeItem(woodIndex, type.cost.wood);
      }
    }
    if (type.cost.stone) {
      const stoneIndex = inventory.findIndex(s => s.item?.id === 'stone');
      if (stoneIndex >= 0) {
        this.inventoryService.removeItem(stoneIndex, type.cost.stone);
      }
    }

    // Create building
    const building: IBuilding = {
      id: `building_${this.nextBuildingId++}`,
      typeId: typeId,
      position: { x, y },
      size: type.size
    };

    // Mark tiles as occupied
    const worldData = this.worldService['worldData'];
    for (let dx = 0; dx < type.size.width; dx++) {
      for (let dy = 0; dy < type.size.height; dy++) {
        const key = `${x + dx},${y + dy}`;
        if (worldData[key]) {
          worldData[key].buildingId = building.id;
        }
      }
    }

    this.buildings.push(building);
    this.buildings$.next(this.buildings);
    this.gameDataService['gameState'].buildings = this.buildings;
    this.worldService['worldData$'].next(worldData);
    this.gameDataService.updateWorldData(worldData);
    this.audioService.playSound('build');

    console.log(`建造了 ${type.name}!`);
    return true;
  }

  removeBuilding(buildingId: string): void {
    const buildingIndex = this.buildings.findIndex(b => b.id === buildingId);
    if (buildingIndex < 0) return;

    const building = this.buildings[buildingIndex];
    
    // Clear tiles
    const worldData = this.worldService['worldData'];
    for (let dx = 0; dx < building.size.width; dx++) {
      for (let dy = 0; dy < building.size.height; dy++) {
        const key = `${building.position.x + dx},${building.position.y + dy}`;
        if (worldData[key]) {
          worldData[key].buildingId = undefined;
        }
      }
    }

    this.buildings.splice(buildingIndex, 1);
    this.buildings$.next(this.buildings);
    this.gameDataService['gameState'].buildings = this.buildings;
    this.worldService['worldData$'].next(worldData);
    this.gameDataService.updateWorldData(worldData);
  }

  getBuildingAt(x: number, y: number): IBuilding | null {
    const tile = this.worldService.getTile(x, y);
    if (!tile || !tile.buildingId) return null;

    return this.buildings.find(b => b.id === tile.buildingId) || null;
  }

  getBuildingType(typeId: string): BuildingType | undefined {
    return this.buildingTypes.get(typeId);
  }
}