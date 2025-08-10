import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { EventService, GameEvent } from '../services/event.service';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-event-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="event-notification" *ngIf="currentEvent" [@slideIn]>
      <div class="event-icon">{{ currentEvent.emoji }}</div>
      <div class="event-content">
        <h3 class="event-title">{{ currentEvent.title }}</h3>
        <p class="event-description">{{ currentEvent.description }}</p>
        <div class="event-effects" *ngIf="currentEvent.effects">
          <span *ngIf="currentEvent.effects.cropGrowthModifier" class="effect">
            🌱 作物生长速度 {{ getModifierText(currentEvent.effects.cropGrowthModifier) }}
          </span>
          <span *ngIf="currentEvent.effects.priceModifier" class="effect">
            💰 价格 {{ getModifierText(currentEvent.effects.priceModifier) }}
          </span>
          <span *ngIf="currentEvent.effects.luckModifier" class="effect">
            🍀 幸运 {{ getModifierText(currentEvent.effects.luckModifier) }}
          </span>
        </div>
        <div class="event-duration">
          持续时间: {{ currentEvent.duration }} 天
        </div>
      </div>
    </div>
  `,
  styles: [`
    .event-notification {
      position: fixed;
      top: 80px;
      right: 20px;
      width: 320px;
      background: linear-gradient(135deg, rgba(50, 50, 80, 0.95), rgba(30, 30, 50, 0.95));
      border: 2px solid rgba(100, 150, 255, 0.6);
      border-radius: 15px;
      padding: 20px;
      color: white;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      z-index: 1400;
    }

    .event-icon {
      font-size: 48px;
      text-align: center;
      margin-bottom: 15px;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }

    .event-title {
      font-size: 20px;
      font-weight: bold;
      margin: 0 0 10px 0;
      text-align: center;
      color: #FFD700;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    }

    .event-description {
      font-size: 14px;
      margin: 0 0 15px 0;
      text-align: center;
      color: #E0E0E0;
      line-height: 1.4;
    }

    .event-effects {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 15px;
      padding: 10px;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 8px;
    }

    .effect {
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .event-duration {
      font-size: 12px;
      text-align: center;
      color: #8BC34A;
      padding-top: 10px;
      border-top: 1px solid rgba(255, 255, 255, 0.2);
    }
  `],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(100%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateX(100%)', opacity: 0 }))
      ])
    ])
  ]
})
export class EventNotificationComponent implements OnInit, OnDestroy {
  currentEvent: GameEvent | null = null;
  private subscription?: Subscription;

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    this.subscription = this.eventService.getCurrentEvent().subscribe(event => {
      this.currentEvent = event;
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  getModifierText(modifier: number): string {
    if (modifier > 1) {
      return `+${Math.round((modifier - 1) * 100)}%`;
    } else if (modifier < 1) {
      return `-${Math.round((1 - modifier) * 100)}%`;
    }
    return '正常';
  }
}