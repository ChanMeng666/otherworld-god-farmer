import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { IItem, IInventorySlot } from '../models/inventory.model';
import { GameDataService } from './game-data.service';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private inventory: IInventorySlot[] = [];
  private inventory$ = new BehaviorSubject<IInventorySlot[]>(this.inventory);
  private selectedSlot = 0;
  private selectedSlot$ = new BehaviorSubject<number>(this.selectedSlot);

  constructor(private gameDataService: GameDataService) {
    this.initializeInventory();
    
    this.gameDataService.getGameState().subscribe(state => {
      if (state.inventory) {
        this.inventory = state.inventory;
        this.inventory$.next(this.inventory);
      }
    });
  }

  private initializeInventory(): void {
    this.inventory = Array(20).fill(null).map(() => ({
      item: null,
      quantity: 0
    }));

    const starterItems: { item: IItem, quantity: number }[] = [
      {
        item: {
          id: 'turnip_seed',
          name: '萝卜种子',
          description: '可以种植萝卜的种子',
          isStackable: true
        },
        quantity: 10
      },
      {
        item: {
          id: 'potato_seed',
          name: '土豆种子',
          description: '可以种植土豆的种子',
          isStackable: true
        },
        quantity: 5
      },
      {
        item: {
          id: 'carrot_seed',
          name: '胡萝卜种子',
          description: '可以种植胡萝卜的种子',
          isStackable: true
        },
        quantity: 5
      }
    ];

    starterItems.forEach((starter, index) => {
      this.inventory[index] = {
        item: starter.item,
        quantity: starter.quantity
      };
    });

    this.inventory$.next(this.inventory);
    this.gameDataService.updateInventory(this.inventory);
  }

  getInventory(): Observable<IInventorySlot[]> {
    return this.inventory$.asObservable();
  }

  getSelectedSlot(): Observable<number> {
    return this.selectedSlot$.asObservable();
  }

  selectSlot(index: number): void {
    if (index >= 0 && index < this.inventory.length) {
      this.selectedSlot = index;
      this.selectedSlot$.next(this.selectedSlot);
    }
  }

  addItem(item: IItem, quantity: number = 1): boolean {
    if (item.isStackable) {
      const existingSlot = this.inventory.find(
        slot => slot.item && slot.item.id === item.id && slot.quantity < 99
      );

      if (existingSlot) {
        existingSlot.quantity = Math.min(99, existingSlot.quantity + quantity);
        this.updateInventory();
        return true;
      }
    }

    const emptySlot = this.inventory.find(slot => !slot.item);
    if (emptySlot) {
      emptySlot.item = item;
      emptySlot.quantity = quantity;
      this.updateInventory();
      return true;
    }

    console.log('背包已满！');
    return false;
  }

  removeItem(index: number, quantity: number = 1): boolean {
    const slot = this.inventory[index];
    
    if (!slot || !slot.item) {
      return false;
    }

    slot.quantity -= quantity;
    
    if (slot.quantity <= 0) {
      slot.item = null;
      slot.quantity = 0;
    }

    this.updateInventory();
    return true;
  }

  getSelectedItem(): IInventorySlot | null {
    return this.inventory[this.selectedSlot];
  }

  useSelectedItem(): boolean {
    const slot = this.getSelectedItem();
    if (!slot || !slot.item) {
      return false;
    }

    return this.removeItem(this.selectedSlot, 1);
  }

  private updateInventory(): void {
    this.inventory$.next(this.inventory);
    this.gameDataService.updateInventory(this.inventory);
  }
}