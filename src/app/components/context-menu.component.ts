import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface MenuAction {
  id: string;
  label: string;
  icon: string;
  enabled?: boolean;
}

@Component({
  selector: 'app-context-menu',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="context-menu" 
      *ngIf="isVisible"
      [style.left.px]="x"
      [style.top.px]="y"
    >
      <div 
        class="menu-item" 
        *ngFor="let action of actions"
        [class.disabled]="!action.enabled"
        (click)="onActionClick(action)"
      >
        <span class="icon">{{ action.icon }}</span>
        <span class="label">{{ action.label }}</span>
      </div>
    </div>
  `,
  styles: [`
    .context-menu {
      position: fixed;
      background: rgba(20, 20, 20, 0.95);
      border: 2px solid rgba(76, 175, 80, 0.5);
      border-radius: 8px;
      padding: 8px 0;
      z-index: 2000;
      min-width: 150px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    }

    .menu-item {
      display: flex;
      align-items: center;
      padding: 8px 16px;
      color: white;
      cursor: pointer;
      transition: background 0.2s;
      gap: 10px;
    }

    .menu-item:hover:not(.disabled) {
      background: rgba(76, 175, 80, 0.3);
    }

    .menu-item.disabled {
      color: rgba(255, 255, 255, 0.3);
      cursor: not-allowed;
    }

    .icon {
      font-size: 18px;
      width: 24px;
      text-align: center;
    }

    .label {
      font-size: 14px;
      flex: 1;
    }
  `]
})
export class ContextMenuComponent implements OnInit, OnDestroy {
  @Input() actions: MenuAction[] = [];
  @Output() actionSelected = new EventEmitter<string>();
  
  isVisible = false;
  x = 0;
  y = 0;

  ngOnInit(): void {
    document.addEventListener('click', this.handleOutsideClick.bind(this));
    document.addEventListener('contextmenu', this.handleContextMenu.bind(this));
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.handleOutsideClick.bind(this));
    document.removeEventListener('contextmenu', this.handleContextMenu.bind(this));
  }

  show(x: number, y: number, actions: MenuAction[]): void {
    this.actions = actions;
    this.x = Math.min(x, window.innerWidth - 200);
    this.y = Math.min(y, window.innerHeight - 200);
    this.isVisible = true;
  }

  hide(): void {
    this.isVisible = false;
  }

  onActionClick(action: MenuAction): void {
    if (action.enabled !== false) {
      this.actionSelected.emit(action.id);
      this.hide();
    }
  }

  private handleOutsideClick(event: MouseEvent): void {
    if (this.isVisible) {
      this.hide();
    }
  }

  private handleContextMenu(event: MouseEvent): void {
    event.preventDefault();
  }
}