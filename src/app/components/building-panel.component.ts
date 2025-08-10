import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BuildingService, BuildingType } from '../services/building.service';
import { GameDataService } from '../services/game-data.service';

@Component({
  selector: 'app-building-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="building-toggle" (click)="togglePanel()">
      <span>🔨</span>
      <span class="label">建造</span>
    </div>

    <div class="building-panel" *ngIf="isVisible">
      <div class="panel-header">
        <h3>🏗️ 建造菜单</h3>
        <button class="close-btn" (click)="togglePanel()">✕</button>
      </div>

      <div class="building-grid">
        <div 
          *ngFor="let building of buildingTypes"
          class="building-card"
          [class.affordable]="canAfford(building.id)"
          [class.selected]="selectedBuilding === building.id"
          (click)="selectBuilding(building.id)"
        >
          <div class="building-icon">{{ building.emoji }}</div>
          <div class="building-name">{{ building.name }}</div>
          <div class="building-cost">
            <span *ngIf="building.cost.wood">🪵x{{ building.cost.wood }}</span>
            <span *ngIf="building.cost.stone">🪨x{{ building.cost.stone }}</span>
          </div>
          <div class="building-desc">{{ building.description }}</div>
        </div>
      </div>

      <div class="placement-info" *ngIf="selectedBuilding">
        <p>选中建筑后，点击地图上的空地来放置</p>
        <button class="cancel-btn" (click)="cancelPlacement()">取消</button>
      </div>
    </div>
  `,
  styles: [`
    .building-toggle {
      position: fixed;
      bottom: 100px;
      left: 20px;
      width: 60px;
      height: 60px;
      background: rgba(0, 0, 0, 0.7);
      border: 2px solid rgba(139, 69, 19, 0.5);
      border-radius: 10px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
      color: white;
    }

    .building-toggle:hover {
      background: rgba(0, 0, 0, 0.9);
      transform: scale(1.05);
    }

    .building-toggle span {
      font-size: 24px;
    }

    .building-toggle .label {
      font-size: 10px;
      margin-top: 2px;
    }

    .building-panel {
      position: fixed;
      left: 90px;
      bottom: 100px;
      width: 350px;
      background: rgba(20, 20, 20, 0.95);
      border: 2px solid rgba(139, 69, 19, 0.5);
      border-radius: 15px;
      padding: 20px;
      z-index: 1000;
    }

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      color: white;
    }

    .panel-header h3 {
      margin: 0;
      font-size: 18px;
    }

    .close-btn {
      background: none;
      border: none;
      color: white;
      font-size: 20px;
      cursor: pointer;
      padding: 0;
      width: 30px;
      height: 30px;
    }

    .close-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 5px;
    }

    .building-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      margin-bottom: 15px;
      max-height: 300px;
      overflow-y: auto;
    }

    .building-card {
      background: rgba(255, 255, 255, 0.05);
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-radius: 10px;
      padding: 10px;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;
      color: white;
      opacity: 0.5;
    }

    .building-card.affordable {
      opacity: 1;
    }

    .building-card.affordable:hover {
      background: rgba(139, 69, 19, 0.3);
      transform: scale(1.05);
    }

    .building-card.selected {
      background: rgba(139, 69, 19, 0.5);
      border-color: #8B4513;
    }

    .building-icon {
      font-size: 32px;
      margin-bottom: 5px;
    }

    .building-name {
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 5px;
    }

    .building-cost {
      font-size: 12px;
      color: #FFD700;
      margin-bottom: 5px;
    }

    .building-cost span {
      margin: 0 3px;
    }

    .building-desc {
      font-size: 11px;
      color: rgba(255, 255, 255, 0.7);
    }

    .placement-info {
      text-align: center;
      color: white;
      padding: 10px;
      background: rgba(139, 69, 19, 0.2);
      border-radius: 10px;
    }

    .placement-info p {
      margin: 0 0 10px 0;
      font-size: 14px;
    }

    .cancel-btn {
      background: rgba(255, 0, 0, 0.3);
      border: 1px solid rgba(255, 0, 0, 0.5);
      color: white;
      padding: 5px 15px;
      border-radius: 5px;
      cursor: pointer;
    }

    .cancel-btn:hover {
      background: rgba(255, 0, 0, 0.5);
    }
  `]
})
export class BuildingPanelComponent implements OnInit {
  isVisible = false;
  buildingTypes: BuildingType[] = [];
  selectedBuilding: string | null = null;

  constructor(
    private buildingService: BuildingService,
    private gameDataService: GameDataService
  ) {}

  ngOnInit(): void {
    this.buildingTypes = this.buildingService.getBuildingTypes();
  }

  togglePanel(): void {
    this.isVisible = !this.isVisible;
    if (!this.isVisible) {
      this.cancelPlacement();
    }
  }

  selectBuilding(typeId: string): void {
    if (this.canAfford(typeId)) {
      this.selectedBuilding = typeId;
      // Notify game canvas to enter building placement mode
      (window as any).buildingPlacementMode = {
        active: true,
        typeId: typeId
      };
    }
  }

  cancelPlacement(): void {
    this.selectedBuilding = null;
    (window as any).buildingPlacementMode = null;
  }

  canAfford(typeId: string): boolean {
    return this.buildingService.canAffordBuilding(typeId);
  }
}