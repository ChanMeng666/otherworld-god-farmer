import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameDataService } from '../services/game-data.service';
import { ToolType } from '../models/player.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tool-wheel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tool-wheel-container" [class.collapsed]="isCollapsed">
      <div class="tool-toggle" (click)="toggleToolbar()">
        <span *ngIf="isCollapsed">🦾 工具栏 ▲</span>
        <span *ngIf="!isCollapsed">🦾 收起 ▼</span>
      </div>
      <div class="tool-wheel" *ngIf="!isCollapsed">
        <div 
          *ngFor="let tool of tools; let i = index" 
          class="tool-slot"
          [class.active]="tool === currentTool"
          (click)="selectTool(tool)"
        >
          <div class="tool-icon">{{ getToolIcon(tool) }}</div>
          <div class="tool-name">{{ getToolName(tool) }}</div>
        </div>
      </div>
      <div class="current-tool-display" *ngIf="!isCollapsed">
        <div class="tool-icon-large">{{ getToolIcon(currentTool) }}</div>
        <div class="tool-name-large">{{ getToolName(currentTool) }}</div>
      </div>
    </div>
  `,
  styles: [`
    .tool-wheel-container {
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      transition: all 0.3s ease;
    }

    .tool-wheel-container.collapsed {
      bottom: 10px;
    }

    .tool-toggle {
      background: rgba(0, 0, 0, 0.8);
      padding: 8px 20px;
      border-radius: 20px;
      border: 2px solid rgba(76, 175, 80, 0.5);
      cursor: pointer;
      color: white;
      font-size: 14px;
      transition: all 0.2s;
    }

    .tool-toggle:hover {
      background: rgba(0, 0, 0, 0.9);
      transform: scale(1.05);
    }

    .tool-wheel {
      display: flex;
      gap: 10px;
      background: rgba(0, 0, 0, 0.7);
      padding: 10px;
      border-radius: 15px;
      border: 2px solid rgba(255, 255, 255, 0.2);
    }

    .tool-slot {
      width: 60px;
      height: 60px;
      background: rgba(255, 255, 255, 0.1);
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 10px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      position: relative;
      transition: all 0.2s ease;
    }

    .tool-slot:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: translateY(-5px);
    }

    .tool-slot.active {
      background: rgba(76, 175, 80, 0.5);
      border-color: #4CAF50;
      box-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
    }

    .tool-icon {
      font-size: 24px;
      margin-bottom: 2px;
    }

    .tool-name {
      font-size: 10px;
      color: white;
      text-align: center;
    }


    .current-tool-display {
      background: rgba(0, 0, 0, 0.8);
      padding: 10px 20px;
      border-radius: 10px;
      border: 2px solid rgba(76, 175, 80, 0.5);
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .tool-icon-large {
      font-size: 32px;
    }

    .tool-name-large {
      color: white;
      font-size: 16px;
      font-weight: bold;
    }
  `]
})
export class ToolWheelComponent implements OnInit, OnDestroy {
  tools: ToolType[] = ['hoe', 'axe', 'pickaxe', 'watering_can', 'hammer', 'fishing_rod'];
  currentTool: ToolType = 'hoe';
  isCollapsed: boolean = true;
  private subscriptions: Subscription[] = [];

  constructor(private gameDataService: GameDataService) {}

  ngOnInit(): void {
    const gameStateSub = this.gameDataService.getGameState().subscribe(state => {
      this.currentTool = state.toolState.currentTool;
    });
    this.subscriptions.push(gameStateSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  toggleToolbar(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  selectTool(tool: ToolType): void {
    this.gameDataService.updateToolState({ currentTool: tool });
  }

  getToolIcon(tool: ToolType): string {
    const icons: Record<ToolType, string> = {
      'hoe': '🌾',
      'axe': '🪓',
      'pickaxe': '⛏️',
      'watering_can': '💧',
      'hammer': '🔨',
      'fishing_rod': '🎣'
    };
    return icons[tool];
  }

  getToolName(tool: ToolType): string {
    const names: Record<ToolType, string> = {
      'hoe': '锄头',
      'axe': '斧头',
      'pickaxe': '镐子',
      'watering_can': '洒水壶',
      'hammer': '锤子',
      'fishing_rod': '钓竿'
    };
    return names[tool];
  }
}