import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { INpcState } from '../models/npc.model';
import { GameDataService } from './game-data.service';
import { TimeService } from './time.service';

export interface NpcDefinition {
  id: string;
  name: string;
  emoji: string;
  personality: string;
  defaultSchedule: Record<string, string>;
  dialogues: {
    greeting: string[];
    daily: string[];
    gift: string[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class NpcService {
  private npcs: INpcState[] = [];
  private npcs$ = new BehaviorSubject<INpcState[]>(this.npcs);
  private npcDefinitions: Map<string, NpcDefinition> = new Map();
  private moveInterval: any;

  constructor(
    private gameDataService: GameDataService,
    private timeService: TimeService
  ) {
    this.initializeNpcDefinitions();
    this.initializeNpcs();
    
    this.gameDataService.getGameState().subscribe(state => {
      if (state.npcs && state.npcs.length > 0) {
        this.npcs = state.npcs;
        this.npcs$.next(this.npcs);
      }
    });

    // Start NPC movement
    this.startNpcMovement();
    
    // Subscribe to time changes for schedule
    this.timeService.onHourChange.subscribe(() => {
      this.updateNpcSchedules();
    });
  }

  private initializeNpcDefinitions(): void {
    const definitions: NpcDefinition[] = [
      {
        id: 'farmer_wang',
        name: '王大爷',
        emoji: '👨‍🌾',
        personality: '友善的老农民',
        defaultSchedule: {
          '6': '在农田工作',
          '12': '在家休息',
          '14': '在市场',
          '18': '回家',
          '22': '睡觉'
        },
        dialogues: {
          greeting: [
            '你好啊，年轻人！',
            '今天天气真不错！',
            '又是美好的一天！'
          ],
          daily: [
            '记得要每天给作物浇水哦！',
            '这个季节种萝卜最合适了。',
            '我年轻时也像你这样勤劳。'
          ],
          gift: [
            '谢谢你的礼物！',
            '你真是太客气了！',
            '我会好好珍惜的。'
          ]
        }
      },
      {
        id: 'merchant_li',
        name: '李商人',
        emoji: '🧑‍💼',
        personality: '精明的商人',
        defaultSchedule: {
          '8': '开店',
          '12': '午休',
          '13': '继续营业',
          '20': '关店'
        },
        dialogues: {
          greeting: [
            '欢迎光临！',
            '今天想买点什么？',
            '我这里货物齐全！'
          ],
          daily: [
            '最近木材很抢手呢。',
            '石头的价格涨了不少。',
            '你的农作物卖得怎么样？'
          ],
          gift: [
            '哦，这可真不错！',
            '你真会做生意！',
            '下次给你个好价钱。'
          ]
        }
      },
      {
        id: 'girl_mei',
        name: '小梅',
        emoji: '👩‍🌾',
        personality: '活泼的女孩',
        defaultSchedule: {
          '7': '在花园',
          '10': '在河边',
          '15': '在广场',
          '19': '回家'
        },
        dialogues: {
          greeting: [
            '嗨！今天过得怎么样？',
            '又见面了！',
            '你的农场真漂亮！'
          ],
          daily: [
            '我最喜欢花了！',
            '河边的风景真美。',
            '要不要一起去散步？'
          ],
          gift: [
            '哇！我最喜欢这个了！',
            '你怎么知道我想要这个？',
            '太感谢了！'
          ]
        }
      }
    ];

    definitions.forEach(def => {
      this.npcDefinitions.set(def.id, def);
    });
  }

  private initializeNpcs(): void {
    const initialNpcs: INpcState[] = [
      {
        id: 'farmer_wang',
        name: '王大爷',
        position: { x: 15, y: 10 },
        relationshipLevel: 0,
        schedule: this.npcDefinitions.get('farmer_wang')!.defaultSchedule,
        dialogueTreeId: 'farmer_wang'
      },
      {
        id: 'merchant_li',
        name: '李商人',
        position: { x: 20, y: 5 },
        relationshipLevel: 0,
        schedule: this.npcDefinitions.get('merchant_li')!.defaultSchedule,
        dialogueTreeId: 'merchant_li'
      },
      {
        id: 'girl_mei',
        name: '小梅',
        position: { x: 10, y: 15 },
        relationshipLevel: 0,
        schedule: this.npcDefinitions.get('girl_mei')!.defaultSchedule,
        dialogueTreeId: 'girl_mei'
      }
    ];

    this.npcs = initialNpcs;
    this.npcs$.next(this.npcs);
    this.gameDataService['gameState'].npcs = this.npcs;
  }

  getNpcs(): Observable<INpcState[]> {
    return this.npcs$.asObservable();
  }

  getNpcAt(x: number, y: number): INpcState | null {
    return this.npcs.find(npc => 
      npc.position.x === x && npc.position.y === y
    ) || null;
  }

  getNpcNear(x: number, y: number, range: number = 1): INpcState | null {
    return this.npcs.find(npc => {
      const distance = Math.abs(npc.position.x - x) + Math.abs(npc.position.y - y);
      return distance <= range;
    }) || null;
  }

  private startNpcMovement(): void {
    // Move NPCs randomly every 5 seconds
    this.moveInterval = setInterval(() => {
      this.npcs.forEach(npc => {
        // Random movement
        const direction = Math.floor(Math.random() * 5); // 0-4, where 4 means no movement
        let newX = npc.position.x;
        let newY = npc.position.y;

        switch(direction) {
          case 0: newY = Math.max(0, newY - 1); break; // Up
          case 1: newY = Math.min(19, newY + 1); break; // Down
          case 2: newX = Math.max(0, newX - 1); break; // Left
          case 3: newX = Math.min(29, newX + 1); break; // Right
          // case 4: no movement
        }

        npc.position = { x: newX, y: newY };
      });

      this.npcs$.next(this.npcs);
      this.gameDataService['gameState'].npcs = this.npcs;
    }, 5000);
  }

  private updateNpcSchedules(): void {
    const currentHour = this.timeService.getTimeState().hour;
    
    this.npcs.forEach(npc => {
      const activity = npc.schedule[currentHour.toString()];
      if (activity) {
        console.log(`${npc.name}: ${activity}`);
      }
    });
  }

  talkToNpc(npcId: string): string {
    const npc = this.npcs.find(n => n.id === npcId);
    const definition = this.npcDefinitions.get(npcId);
    
    if (!npc || !definition) return '...';

    // Get random dialogue based on relationship level
    let dialogues: string[];
    if (npc.relationshipLevel < 2) {
      dialogues = definition.dialogues.greeting;
    } else {
      dialogues = definition.dialogues.daily;
    }

    const dialogue = dialogues[Math.floor(Math.random() * dialogues.length)];
    
    // Increase relationship slightly
    this.increaseRelationship(npcId, 1);
    
    return dialogue;
  }

  giveGift(npcId: string): string {
    const npc = this.npcs.find(n => n.id === npcId);
    const definition = this.npcDefinitions.get(npcId);
    
    if (!npc || !definition) return '...';

    const dialogues = definition.dialogues.gift;
    const dialogue = dialogues[Math.floor(Math.random() * dialogues.length)];
    
    // Increase relationship significantly
    this.increaseRelationship(npcId, 10);
    
    return dialogue;
  }

  private increaseRelationship(npcId: string, amount: number): void {
    const npc = this.npcs.find(n => n.id === npcId);
    if (npc) {
      npc.relationshipLevel = Math.min(100, npc.relationshipLevel + amount);
      this.npcs$.next(this.npcs);
      this.gameDataService['gameState'].npcs = this.npcs;
    }
  }

  getNpcDefinition(npcId: string): NpcDefinition | undefined {
    return this.npcDefinitions.get(npcId);
  }

  ngOnDestroy(): void {
    if (this.moveInterval) {
      clearInterval(this.moveInterval);
    }
  }
}