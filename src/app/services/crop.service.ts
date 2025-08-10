import { Injectable } from '@angular/core';
import { WorldService } from './world.service';
import { TimeService } from './time.service';
import { ICropState } from '../models/crop.model';
import { IItem } from '../models/inventory.model';
import { AudioService } from './audio.service';

export interface CropDefinition {
  id: string;
  name: string;
  seedItemId: string;
  produceItemId: string;
  growthStages: number;
  daysPerStage: number;
  seasons: string[];
}

@Injectable({
  providedIn: 'root'
})
export class CropService {
  private cropDefinitions: Map<string, CropDefinition> = new Map();

  constructor(
    private worldService: WorldService,
    private timeService: TimeService,
    private audioService: AudioService
  ) {
    this.initializeCropDefinitions();
    this.subscribeToTimeChanges();
  }

  private initializeCropDefinitions(): void {
    const crops: CropDefinition[] = [
      {
        id: 'turnip',
        name: '萝卜',
        seedItemId: 'turnip_seed',
        produceItemId: 'turnip',
        growthStages: 4,
        daysPerStage: 1,
        seasons: ['Spring', 'Summer']
      },
      {
        id: 'potato',
        name: '土豆',
        seedItemId: 'potato_seed',
        produceItemId: 'potato',
        growthStages: 5,
        daysPerStage: 2,
        seasons: ['Spring', 'Summer', 'Autumn']
      },
      {
        id: 'carrot',
        name: '胡萝卜',
        seedItemId: 'carrot_seed',
        produceItemId: 'carrot',
        growthStages: 4,
        daysPerStage: 2,
        seasons: ['Spring', 'Autumn']
      },
      {
        id: 'wheat',
        name: '小麦',
        seedItemId: 'wheat_seed',
        produceItemId: 'wheat',
        growthStages: 6,
        daysPerStage: 1,
        seasons: ['Summer', 'Autumn']
      },
      {
        id: 'tomato',
        name: '番茄',
        seedItemId: 'tomato_seed',
        produceItemId: 'tomato',
        growthStages: 5,
        daysPerStage: 2,
        seasons: ['Summer']
      },
      {
        id: 'corn',
        name: '玉米',
        seedItemId: 'corn_seed',
        produceItemId: 'corn',
        growthStages: 7,
        daysPerStage: 2,
        seasons: ['Summer', 'Autumn']
      },
      {
        id: 'pumpkin',
        name: '南瓜',
        seedItemId: 'pumpkin_seed',
        produceItemId: 'pumpkin',
        growthStages: 8,
        daysPerStage: 3,
        seasons: ['Autumn']
      },
      {
        id: 'strawberry',
        name: '草莓',
        seedItemId: 'strawberry_seed',
        produceItemId: 'strawberry',
        growthStages: 4,
        daysPerStage: 1,
        seasons: ['Spring', 'Summer']
      },
      {
        id: 'cabbage',
        name: '卷心菜',
        seedItemId: 'cabbage_seed',
        produceItemId: 'cabbage',
        growthStages: 6,
        daysPerStage: 2,
        seasons: ['Spring', 'Autumn', 'Winter']
      },
      {
        id: 'rice',
        name: '稻米',
        seedItemId: 'rice_seed',
        produceItemId: 'rice',
        growthStages: 7,
        daysPerStage: 3,
        seasons: ['Spring', 'Summer']
      }
    ];

    crops.forEach(crop => {
      this.cropDefinitions.set(crop.seedItemId, crop);
    });
  }

  private subscribeToTimeChanges(): void {
    this.timeService.onDayChange.subscribe(() => {
      this.updateAllCrops();
    });
  }

  plantSeed(x: number, y: number, seedItemId: string): boolean {
    const tile = this.worldService.getTile(x, y);
    if (!tile || tile.type !== 'tilled_soil' || tile.crop) {
      return false;
    }

    const cropDef = this.cropDefinitions.get(seedItemId);
    if (!cropDef) {
      return false;
    }

    const cropState: ICropState = {
      itemId: seedItemId,
      growthStage: 0,
      maxGrowthStage: cropDef.growthStages,
      daysToNextStage: cropDef.daysPerStage
    };

    tile.crop = cropState;
    this.worldService['worldData$'].next(this.worldService['worldData']);
    this.worldService['gameDataService'].updateWorldData(this.worldService['worldData']);
    this.audioService.playSound('plant');
    
    return true;
  }

  harvestCrop(x: number, y: number): IItem | null {
    const tile = this.worldService.getTile(x, y);
    if (!tile || !tile.crop) {
      return null;
    }

    const crop = tile.crop;
    if (crop.growthStage < crop.maxGrowthStage) {
      return null;
    }

    const cropDef = this.cropDefinitions.get(crop.itemId);
    if (!cropDef) {
      return null;
    }

    const harvestedItem: IItem = {
      id: cropDef.produceItemId,
      name: cropDef.name,
      description: `新鲜的${cropDef.name}`,
      isStackable: true
    };

    tile.crop = undefined;
    tile.type = 'dirt';
    this.worldService['worldData$'].next(this.worldService['worldData']);
    this.worldService['gameDataService'].updateWorldData(this.worldService['worldData']);
    this.audioService.playSound('harvest');

    return harvestedItem;
  }

  private updateAllCrops(): void {
    const worldData = this.worldService['worldData'];
    
    Object.values(worldData).forEach(tile => {
      if (tile.crop && tile.isWatered) {
        this.growCrop(tile.crop);
        tile.isWatered = false;
      }
    });

    this.worldService['worldData$'].next(worldData);
    this.worldService['gameDataService'].updateWorldData(worldData);
  }

  private growCrop(crop: ICropState): void {
    if (crop.growthStage >= crop.maxGrowthStage) {
      return;
    }

    crop.daysToNextStage--;
    
    if (crop.daysToNextStage <= 0) {
      crop.growthStage++;
      
      const cropDef = this.cropDefinitions.get(crop.itemId);
      if (cropDef) {
        crop.daysToNextStage = cropDef.daysPerStage;
      }
    }
  }

  getCropDefinition(seedItemId: string): CropDefinition | undefined {
    return this.cropDefinitions.get(seedItemId);
  }
}