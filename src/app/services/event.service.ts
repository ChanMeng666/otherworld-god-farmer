import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TimeService } from './time.service';
import { InventoryService } from './inventory.service';
import { WorldService } from './world.service';
import { AudioService } from './audio.service';

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  emoji: string;
  type: 'weather' | 'festival' | 'merchant' | 'disaster' | 'blessing';
  duration: number;
  effects?: {
    cropGrowthModifier?: number;
    priceModifier?: number;
    luckModifier?: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private currentEvent: GameEvent | null = null;
  private currentEvent$ = new BehaviorSubject<GameEvent | null>(null);
  private eventHistory: GameEvent[] = [];
  private eventDaysRemaining = 0;

  private events: GameEvent[] = [
    {
      id: 'rain',
      title: '雨天',
      description: '下雨了！作物自动浇水',
      emoji: '🌧️',
      type: 'weather',
      duration: 2,
      effects: {
        cropGrowthModifier: 1.2
      }
    },
    {
      id: 'sunny',
      title: '晴天',
      description: '阳光明媚，作物生长加快',
      emoji: '☀️',
      type: 'weather',
      duration: 3,
      effects: {
        cropGrowthModifier: 1.1
      }
    },
    {
      id: 'merchant',
      title: '商人来访',
      description: '神秘商人带来了稀有种子',
      emoji: '🧙',
      type: 'merchant',
      duration: 1,
      effects: {
        priceModifier: 0.8
      }
    },
    {
      id: 'harvest_festival',
      title: '丰收节',
      description: '村民们在庆祝丰收！农产品价格上涨',
      emoji: '🎊',
      type: 'festival',
      duration: 3,
      effects: {
        priceModifier: 1.5
      }
    },
    {
      id: 'drought',
      title: '干旱',
      description: '天气干旱，作物需要更多水分',
      emoji: '🏜️',
      type: 'disaster',
      duration: 2,
      effects: {
        cropGrowthModifier: 0.7
      }
    },
    {
      id: 'storm',
      title: '暴风雨',
      description: '暴风雨来袭！部分作物可能受损',
      emoji: '⛈️',
      type: 'disaster',
      duration: 1,
      effects: {
        cropGrowthModifier: 0.5
      }
    },
    {
      id: 'fairy_blessing',
      title: '精灵祝福',
      description: '森林精灵祝福了你的农场',
      emoji: '🧚',
      type: 'blessing',
      duration: 5,
      effects: {
        cropGrowthModifier: 1.5,
        luckModifier: 2
      }
    },
    {
      id: 'spring_festival',
      title: '春节',
      description: '新年快乐！获得红包奖励',
      emoji: '🧧',
      type: 'festival',
      duration: 3,
      effects: {
        luckModifier: 3
      }
    },
    {
      id: 'meteor_shower',
      title: '流星雨',
      description: '美丽的流星雨照亮夜空',
      emoji: '☄️',
      type: 'blessing',
      duration: 1,
      effects: {
        luckModifier: 1.5
      }
    },
    {
      id: 'market_day',
      title: '集市日',
      description: '今天是集市日，商品需求增加',
      emoji: '🏪',
      type: 'merchant',
      duration: 1,
      effects: {
        priceModifier: 1.3
      }
    }
  ];

  constructor(
    private timeService: TimeService,
    private inventoryService: InventoryService,
    private worldService: WorldService,
    private audioService: AudioService
  ) {
    this.subscribeToTimeChanges();
  }

  private subscribeToTimeChanges(): void {
    this.timeService.onDayChange.subscribe(() => {
      this.updateEvent();
      this.checkForRandomEvent();
    });
  }

  private updateEvent(): void {
    if (this.currentEvent && this.eventDaysRemaining > 0) {
      this.eventDaysRemaining--;
      
      if (this.eventDaysRemaining <= 0) {
        this.endEvent();
      }
    }
  }

  private checkForRandomEvent(): void {
    // 20% chance of random event each day
    if (!this.currentEvent && Math.random() < 0.2) {
      const randomEvent = this.events[Math.floor(Math.random() * this.events.length)];
      this.startEvent(randomEvent);
    }
  }

  private startEvent(event: GameEvent): void {
    this.currentEvent = event;
    this.eventDaysRemaining = event.duration;
    this.currentEvent$.next(event);
    this.eventHistory.push(event);
    
    // Apply event effects
    if (event.effects) {
      this.applyEventEffects(event);
    }
    
    // Play sound based on event type
    if (event.type === 'blessing' || event.type === 'festival') {
      this.audioService.playSound('success');
    } else if (event.type === 'disaster') {
      this.audioService.playSound('error');
    }
    
    console.log(`事件开始: ${event.title} - ${event.description}`);
  }

  private endEvent(): void {
    if (this.currentEvent) {
      console.log(`事件结束: ${this.currentEvent.title}`);
      this.removeEventEffects(this.currentEvent);
      this.currentEvent = null;
      this.currentEvent$.next(null);
    }
  }

  private applyEventEffects(event: GameEvent): void {
    if (event.id === 'rain') {
      // Auto-water all tilled soil
      const worldData = this.worldService['worldData'];
      Object.values(worldData).forEach(tile => {
        if (tile.type === 'tilled_soil') {
          tile.isWatered = true;
        }
      });
      this.worldService['worldData$'].next(worldData);
    }
    
    if (event.id === 'spring_festival') {
      // Give red packet reward
      this.inventoryService.addItem({
        id: 'red_packet',
        name: '红包',
        description: '新年红包，内含金币',
        isStackable: true
      }, 3);
    }
    
    if (event.id === 'merchant') {
      // Add rare seeds to inventory
      const rareSeed = {
        id: 'mystery_seed',
        name: '神秘种子',
        description: '商人带来的稀有种子',
        isStackable: true
      };
      this.inventoryService.addItem(rareSeed, 2);
    }
  }

  private removeEventEffects(event: GameEvent): void {
    // Remove any temporary effects
    // Most effects are passive modifiers that don't need explicit removal
  }

  getCurrentEvent(): Observable<GameEvent | null> {
    return this.currentEvent$.asObservable();
  }

  getEventEffects(): any {
    return this.currentEvent?.effects || {};
  }

  triggerSpecialEvent(eventId: string): void {
    const event = this.events.find(e => e.id === eventId);
    if (event && !this.currentEvent) {
      this.startEvent(event);
    }
  }
}