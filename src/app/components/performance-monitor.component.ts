import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { interval, Subscription } from 'rxjs';
import { PerformanceService } from '../services/performance.service';

@Component({
  selector: 'app-performance-monitor',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="performance-monitor" *ngIf="showMonitor">
      <div class="stat">
        <span class="label">FPS:</span>
        <span class="value" [class.good]="fps >= 50" [class.warning]="fps >= 30 && fps < 50" [class.bad]="fps < 30">
          {{ fps }}
        </span>
      </div>
      <div class="stat" *ngIf="stats">
        <span class="label">Draw Calls:</span>
        <span class="value">{{ stats.drawCalls }}</span>
      </div>
      <div class="stat" *ngIf="stats">
        <span class="label">Textures:</span>
        <span class="value">{{ stats.textures }}</span>
      </div>
      <button class="toggle-btn" (click)="toggleDetails()">
        {{ showDetails ? '📊' : '📈' }}
      </button>
    </div>
  `,
  styles: [`
    .performance-monitor {
      position: fixed;
      top: 10px;
      left: 10px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 10px;
      border-radius: 8px;
      font-family: monospace;
      font-size: 12px;
      z-index: 2000;
      min-width: 120px;
    }

    .stat {
      display: flex;
      justify-content: space-between;
      margin-bottom: 5px;
    }

    .label {
      color: #888;
      margin-right: 10px;
    }

    .value {
      font-weight: bold;
    }

    .value.good {
      color: #4CAF50;
    }

    .value.warning {
      color: #FFC107;
    }

    .value.bad {
      color: #F44336;
    }

    .toggle-btn {
      position: absolute;
      top: 5px;
      right: 5px;
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      font-size: 16px;
      padding: 0;
      width: 20px;
      height: 20px;
    }

    .toggle-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
    }
  `]
})
export class PerformanceMonitorComponent implements OnInit, OnDestroy {
  fps = 0;
  stats: any = null;
  showMonitor = true;
  showDetails = false;
  private updateSubscription?: Subscription;

  constructor(private performanceService: PerformanceService) {}

  ngOnInit(): void {
    // Update performance stats every 100ms
    this.updateSubscription = interval(100).subscribe(() => {
      this.fps = this.performanceService.getFPS();
      
      if (this.showDetails) {
        this.stats = this.performanceService.getRenderStats();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
    }
  }

  toggleDetails(): void {
    this.showDetails = !this.showDetails;
    if (!this.showDetails) {
      this.stats = null;
    }
  }
}