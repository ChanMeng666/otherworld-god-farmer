import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryService } from '../services/inventory.service';
import { IInventorySlot } from '../models/inventory.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-inventory-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="inventory-panel" [class.visible]="isVisible">
      <div class="inventory-header">
        <h3>背包</h3>
        <button class="close-btn" (click)="toggleInventory()">✕</button>
      </div>
      <div class="inventory-grid">
        <div 
          *ngFor="let slot of inventory; let i = index"
          class="inventory-slot"
          [class.selected]="i === selectedSlot"
          [class.has-item]="slot.item !== null"
          (click)="selectSlot(i)"
        >
          <div class="item-icon" *ngIf="slot.item">
            {{ getItemIcon(slot.item.id) }}
          </div>
          <div class="item-quantity" *ngIf="slot.item && slot.quantity > 1">
            {{ slot.quantity }}
          </div>
          <div class="slot-number">{{ i + 1 }}</div>
        </div>
      </div>
      <div class="item-info" *ngIf="selectedItem?.item">
        <h4>{{ selectedItem.item.name }}</h4>
        <p>{{ selectedItem.item.description }}</p>
        <p class="quantity">数量: {{ selectedItem.quantity }}</p>
      </div>
    </div>
    
    <div class="inventory-toggle" (click)="toggleInventory()">
      <span>🎒</span>
      <span class="hotkey">背包</span>
    </div>
  `,
  styles: [`
    .inventory-panel {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(20, 20, 20, 0.95);
      border: 2px solid rgba(76, 175, 80, 0.5);
      border-radius: 15px;
      padding: 20px;
      color: white;
      min-width: 400px;
      max-width: 500px;
      display: none;
      z-index: 1000;
    }

    .inventory-panel.visible {
      display: block;
    }

    .inventory-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    }

    .inventory-header h3 {
      margin: 0;
      font-size: 20px;
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
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 5px;
      transition: background 0.2s;
    }

    .close-btn:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .inventory-grid {
      display: grid;
      grid-template-columns: repeat(10, 1fr);
      gap: 5px;
      margin-bottom: 15px;
    }

    .inventory-slot {
      width: 40px;
      height: 40px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 5px;
      position: relative;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .inventory-slot:hover {
      background: rgba(255, 255, 255, 0.1);
      transform: scale(1.05);
    }

    .inventory-slot.selected {
      background: rgba(76, 175, 80, 0.3);
      border-color: #4CAF50;
      box-shadow: 0 0 5px rgba(76, 175, 80, 0.5);
    }

    .inventory-slot.has-item {
      background: rgba(255, 255, 255, 0.08);
    }

    .item-icon {
      font-size: 24px;
    }

    .item-quantity {
      position: absolute;
      bottom: 0;
      right: 2px;
      font-size: 10px;
      background: rgba(0, 0, 0, 0.7);
      padding: 1px 3px;
      border-radius: 3px;
    }

    .slot-number {
      position: absolute;
      top: 1px;
      left: 2px;
      font-size: 8px;
      color: rgba(255, 255, 255, 0.3);
    }

    .item-info {
      padding-top: 15px;
      border-top: 1px solid rgba(255, 255, 255, 0.2);
    }

    .item-info h4 {
      margin: 0 0 5px 0;
      color: #4CAF50;
    }

    .item-info p {
      margin: 5px 0;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.8);
    }

    .item-info .quantity {
      color: #FFD700;
    }

    .inventory-toggle {
      position: absolute;
      bottom: 100px;
      right: 20px;
      width: 60px;
      height: 60px;
      background: rgba(0, 0, 0, 0.7);
      border: 2px solid rgba(76, 175, 80, 0.5);
      border-radius: 10px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
    }

    .inventory-toggle:hover {
      background: rgba(0, 0, 0, 0.9);
      transform: scale(1.05);
    }

    .inventory-toggle span {
      font-size: 24px;
    }

    .inventory-toggle .hotkey {
      font-size: 10px;
      color: rgba(255, 255, 255, 0.6);
      margin-top: 2px;
    }
  `]
})
export class InventoryPanelComponent implements OnInit, OnDestroy {
  inventory: IInventorySlot[] = [];
  selectedSlot = 0;
  selectedItem: IInventorySlot | null = null;
  isVisible = false;
  private subscriptions: Subscription[] = [];

  constructor(private inventoryService: InventoryService) {}

  ngOnInit(): void {
    const inventorySub = this.inventoryService.getInventory().subscribe(inventory => {
      this.inventory = inventory;
      this.updateSelectedItem();
    });

    const selectedSub = this.inventoryService.getSelectedSlot().subscribe(slot => {
      this.selectedSlot = slot;
      this.updateSelectedItem();
    });

    this.subscriptions.push(inventorySub, selectedSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  toggleInventory(): void {
    this.isVisible = !this.isVisible;
  }

  selectSlot(index: number): void {
    this.inventoryService.selectSlot(index);
  }

  private updateSelectedItem(): void {
    this.selectedItem = this.inventory[this.selectedSlot];
  }


  getItemIcon(itemId: string): string {
    const icons: Record<string, string> = {
      'turnip_seed': '🌱',
      'potato_seed': '🥔',
      'carrot_seed': '🥕',
      'wheat_seed': '🌾',
      'turnip': '🥬',
      'potato': '🥔',
      'carrot': '🥕',
      'wheat': '🌾',
      'wood': '🪵',
      'stone': '🪨'
    };
    return icons[itemId] || '📦';
  }
}