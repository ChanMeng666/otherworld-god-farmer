import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameDataService } from '../services/game-data.service';
import { TimeService } from '../services/time.service';
import { Subscription } from 'rxjs';
import { IPlayerState } from '../models/player.model';
import { ITimeState } from '../models/time.model';

@Component({
  selector: 'app-player-hud',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="hud-container">
      <div class="time-display">
        <div class="season">{{ timeState.season }}</div>
        <div class="date">Day {{ timeState.day }}, Year {{ timeState.year }}</div>
        <div class="clock">{{ formatTime(timeState.hour, timeState.minute) }}</div>
      </div>
      
      <div class="stamina-bar">
        <div class="label">Stamina</div>
        <div class="bar">
          <div class="fill" [style.width.%]="getStaminaPercentage()"></div>
        </div>
        <div class="value">{{ playerState.stamina.current }} / {{ playerState.stamina.max }}</div>
      </div>
    </div>
  `,
  styles: [`
    .hud-container {
      position: absolute;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 15px;
      border-radius: 10px;
      font-family: 'Courier New', monospace;
      min-width: 200px;
    }

    .time-display {
      margin-bottom: 15px;
      text-align: center;
    }

    .season {
      font-size: 18px;
      font-weight: bold;
      color: #4CAF50;
      margin-bottom: 5px;
    }

    .date {
      font-size: 14px;
      margin-bottom: 5px;
    }

    .clock {
      font-size: 20px;
      font-weight: bold;
    }

    .stamina-bar {
      margin-top: 10px;
    }

    .label {
      font-size: 12px;
      margin-bottom: 5px;
    }

    .bar {
      width: 100%;
      height: 20px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 10px;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.3);
    }

    .fill {
      height: 100%;
      background: linear-gradient(90deg, #4CAF50, #8BC34A);
      transition: width 0.3s ease;
    }

    .value {
      font-size: 11px;
      text-align: center;
      margin-top: 5px;
      color: rgba(255, 255, 255, 0.8);
    }
  `]
})
export class PlayerHudComponent implements OnInit, OnDestroy {
  playerState: IPlayerState = {
    position: { x: 0, y: 0 },
    stamina: { current: 100, max: 100 },
    movementState: 'idle'
  };

  timeState: ITimeState = {
    minute: 0,
    hour: 6,
    day: 1,
    season: 'Spring',
    year: 1
  };

  private subscriptions: Subscription[] = [];

  constructor(
    private gameDataService: GameDataService,
    private timeService: TimeService
  ) {}

  ngOnInit(): void {
    const gameStateSub = this.gameDataService.getGameState().subscribe(state => {
      this.playerState = state.playerState;
      this.timeState = state.timeState;
    });

    this.subscriptions.push(gameStateSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  getStaminaPercentage(): number {
    return (this.playerState.stamina.current / this.playerState.stamina.max) * 100;
  }

  formatTime(hour: number, minute: number): string {
    const displayHour = hour > 24 ? hour - 24 : hour;
    const period = (hour >= 12 && hour < 24) ? 'PM' : 'AM';
    const formattedHour = displayHour === 0 ? 12 : displayHour > 12 ? displayHour - 12 : displayHour;
    const formattedMinute = minute.toString().padStart(2, '0');
    return `${formattedHour}:${formattedMinute} ${period}`;
  }
}