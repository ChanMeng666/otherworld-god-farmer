import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryService } from '../services/inventory.service';
import { IInventorySlot } from '../models/inventory.model';

@Component({
  selector: 'app-seed-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="seed-selector" *ngIf="isVisible">
      <div class="selector-header">
        <h3>选择种子</h3>
        <button class="close-btn" (click)="close()">✕</button>
      </div>
      <div class="seed-grid">
        <div 
          *ngFor="let slot of seedSlots; let i = index"
          class="seed-slot"
          [class.has-seeds]="slot.quantity > 0"
          (click)="selectSeed(i)"
        >
          <div class="seed-icon">{{ getItemIcon(slot.item?.id || '') }}</div>
          <div class="seed-name">{{ slot.item?.name || '空' }}</div>
          <div class="seed-quantity">x{{ slot.quantity }}</div>
        </div>
      </div>
      <div class="tip">点击选择要种植的种子</div>
    </div>
  `,
  styles: [`
    .seed-selector {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(20, 20, 20, 0.95);
      border: 2px solid rgba(76, 175, 80, 0.5);
      border-radius: 15px;
      padding: 20px;
      z-index: 3000;
      min-width: 300px;
    }

    .selector-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      color: white;
    }

    .selector-header h3 {
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

    .seed-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-bottom: 15px;
    }

    .seed-slot {
      background: rgba(255, 255, 255, 0.05);
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-radius: 10px;
      padding: 15px;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;
      color: white;
    }

    .seed-slot.has-seeds:hover {
      background: rgba(76, 175, 80, 0.3);
      transform: scale(1.05);
    }

    .seed-slot:not(.has-seeds) {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .seed-icon {
      font-size: 32px;
      margin-bottom: 5px;
    }

    .seed-name {
      font-size: 12px;
      margin-bottom: 5px;
    }

    .seed-quantity {
      font-size: 14px;
      color: #FFD700;
    }

    .tip {
      text-align: center;
      color: rgba(255, 255, 255, 0.6);
      font-size: 12px;
    }
  `]
})
export class SeedSelectorComponent implements OnInit {
  @Output() seedSelected = new EventEmitter<number>();
  @Output() closed = new EventEmitter<void>();
  
  isVisible = false;
  seedSlots: IInventorySlot[] = [];
  private targetPosition: { x: number, y: number } | null = null;

  constructor(private inventoryService: InventoryService) {}

  ngOnInit(): void {
    this.inventoryService.getInventory().subscribe(inventory => {
      this.seedSlots = inventory.filter(slot => 
        slot.item && slot.item.id.endsWith('_seed') && slot.quantity > 0
      );
    });
  }

  show(x: number, y: number): void {
    this.targetPosition = { x, y };
    this.isVisible = true;
  }

  close(): void {
    this.isVisible = false;
    this.closed.emit();
  }

  selectSeed(index: number): void {
    const slot = this.seedSlots[index];
    if (slot && slot.quantity > 0) {
      // Find the actual inventory index
      const inventory = this.inventoryService['inventory'];
      const actualIndex = inventory.findIndex(s => s === slot);
      
      if (actualIndex >= 0) {
        this.inventoryService.selectSlot(actualIndex);
        this.seedSelected.emit(actualIndex);
        this.close();
      }
    }
  }

  getItemIcon(itemId: string): string {
    const icons: Record<string, string> = {
      'turnip_seed': '🌱',
      'potato_seed': '🥔',
      'carrot_seed': '🥕',
      'wheat_seed': '🌾'
    };
    return icons[itemId] || '🌰';
  }
}