import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ISaveData } from '../models/save-data.model';
import { IPlayerState, IAllPurposeToolState } from '../models/player.model';
import { WorldData } from '../models/world.model';
import { IInventorySlot } from '../models/inventory.model';
import { ITimeState } from '../models/time.model';
import { IBuilding } from '../models/building.model';
import { INpcState } from '../models/npc.model';

@Injectable({
  providedIn: 'root'
})
export class GameDataService {
  private gameState: ISaveData = this.getInitialGameState();
  private gameState$ = new BehaviorSubject<ISaveData>(this.gameState);

  constructor() { }

  getGameState(): Observable<ISaveData> {
    return this.gameState$.asObservable();
  }

  updatePlayerState(playerState: Partial<IPlayerState>): void {
    this.gameState.playerState = { ...this.gameState.playerState, ...playerState };
    this.gameState$.next(this.gameState);
  }

  updateToolState(toolState: Partial<IAllPurposeToolState>): void {
    this.gameState.toolState = { ...this.gameState.toolState, ...toolState };
    this.gameState$.next(this.gameState);
  }

  updateWorldData(worldData: WorldData): void {
    this.gameState.worldData = worldData;
    this.gameState$.next(this.gameState);
  }

  updateInventory(inventory: IInventorySlot[]): void {
    this.gameState.inventory = inventory;
    this.gameState$.next(this.gameState);
  }

  updateTimeState(timeState: Partial<ITimeState>): void {
    this.gameState.timeState = { ...this.gameState.timeState, ...timeState };
    this.gameState$.next(this.gameState);
  }

  saveGame(): ISaveData {
    return this.gameState;
  }

  loadGame(saveData: ISaveData): void {
    this.gameState = saveData;
    this.gameState$.next(this.gameState);
  }

  private getInitialGameState(): ISaveData {
    return {
      playerState: {
        position: { x: 10, y: 10 },
        stamina: { current: 100, max: 100 },
        movementState: 'idle'
      },
      toolState: {
        currentTool: 'hoe',
        levels: {
          hoe: 1,
          axe: 1,
          pickaxe: 1,
          watering_can: 1,
          hammer: 1,
          fishing_rod: 1
        },
        abilities: {
          hoe: [],
          axe: [],
          pickaxe: [],
          watering_can: [],
          hammer: [],
          fishing_rod: []
        }
      },
      worldData: {},
      inventory: Array(20).fill(null).map(() => ({ item: null, quantity: 0 })),
      timeState: {
        minute: 0,
        hour: 6,
        day: 1,
        season: 'Spring',
        year: 1
      },
      buildings: [],
      npcs: []
    };
  }
}