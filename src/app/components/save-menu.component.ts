import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SaveGameService } from '../services/save-game.service';

@Component({
  selector: 'app-save-menu',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="save-menu-toggle" (click)="toggleMenu()">
      <span>💾</span>
      <span class="label">存档</span>
    </div>

    <div class="save-menu" *ngIf="isVisible">
      <div class="menu-header">
        <h3>💾 游戏存档</h3>
        <button class="close-btn" (click)="toggleMenu()">✕</button>
      </div>

      <div class="menu-content">
        <div class="save-info">
          <p>玩家ID: {{ userId }}</p>
          <p class="hint">存档会保存到服务器</p>
        </div>

        <div class="button-group">
          <button class="save-btn" (click)="saveGame()" [disabled]="isSaving">
            <span *ngIf="!isSaving">💾 保存游戏</span>
            <span *ngIf="isSaving">⏳ 保存中...</span>
          </button>

          <button class="load-btn" (click)="loadGame()" [disabled]="isLoading">
            <span *ngIf="!isLoading">📂 加载游戏</span>
            <span *ngIf="isLoading">⏳ 加载中...</span>
          </button>

          <button class="new-btn" (click)="newGame()">
            🆕 新游戏
          </button>
        </div>

        <div class="auto-save-section">
          <label>
            <input 
              type="checkbox" 
              [checked]="autoSaveEnabled" 
              (change)="toggleAutoSave()"
            >
            自动保存 (每分钟)
          </label>
        </div>

        <div class="save-status" *ngIf="statusMessage">
          {{ statusMessage }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .save-menu-toggle {
      position: fixed;
      bottom: 180px;
      right: 20px;
      width: 60px;
      height: 60px;
      background: rgba(0, 0, 0, 0.7);
      border: 2px solid rgba(255, 215, 0, 0.5);
      border-radius: 10px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
      color: white;
      z-index: 1000;
    }

    .save-menu-toggle:hover {
      background: rgba(0, 0, 0, 0.9);
      transform: scale(1.05);
    }

    .save-menu-toggle span {
      font-size: 24px;
    }

    .save-menu-toggle .label {
      font-size: 10px;
      margin-top: 2px;
    }

    .save-menu {
      position: fixed;
      right: 90px;
      bottom: 180px;
      width: 300px;
      background: rgba(20, 20, 20, 0.95);
      border: 2px solid rgba(255, 215, 0, 0.5);
      border-radius: 15px;
      padding: 20px;
      z-index: 1000;
      color: white;
    }

    .menu-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    }

    .menu-header h3 {
      margin: 0;
      font-size: 18px;
      color: #FFD700;
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

    .save-info {
      margin-bottom: 20px;
      padding: 10px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 10px;
    }

    .save-info p {
      margin: 5px 0;
      font-size: 12px;
    }

    .save-info .hint {
      color: rgba(255, 255, 255, 0.6);
      font-style: italic;
    }

    .button-group {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-bottom: 20px;
    }

    .button-group button {
      padding: 10px;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.2s;
      color: white;
      font-weight: bold;
    }

    .save-btn {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .save-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    }

    .load-btn {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }

    .load-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    }

    .new-btn {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    }

    .new-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .auto-save-section {
      padding: 10px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 10px;
      margin-bottom: 15px;
    }

    .auto-save-section label {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      font-size: 14px;
    }

    .auto-save-section input[type="checkbox"] {
      width: 20px;
      height: 20px;
      cursor: pointer;
    }

    .save-status {
      padding: 10px;
      background: rgba(76, 175, 80, 0.2);
      border-radius: 10px;
      text-align: center;
      font-size: 14px;
      color: #4CAF50;
    }
  `]
})
export class SaveMenuComponent implements OnInit, OnDestroy {
  isVisible = false;
  isSaving = false;
  isLoading = false;
  autoSaveEnabled = false;
  statusMessage = '';
  userId = '';

  constructor(private saveGameService: SaveGameService) {}

  ngOnInit(): void {
    this.userId = this.saveGameService.getUserId();
    
    // Try to load game on startup
    this.loadGame();
    
    // Start auto-save by default
    this.autoSaveEnabled = true;
    this.saveGameService.startAutoSave(1);
  }

  ngOnDestroy(): void {
    // Save game when component is destroyed
    this.saveGame();
    this.saveGameService.stopAutoSave();
  }

  toggleMenu(): void {
    this.isVisible = !this.isVisible;
  }

  saveGame(): void {
    this.isSaving = true;
    this.statusMessage = '';

    this.saveGameService.saveGame().subscribe({
      next: (response) => {
        this.isSaving = false;
        this.statusMessage = '游戏已保存！';
        setTimeout(() => this.statusMessage = '', 3000);
      },
      error: (error) => {
        this.isSaving = false;
        this.statusMessage = '保存失败，请检查服务器';
        setTimeout(() => this.statusMessage = '', 3000);
      }
    });
  }

  loadGame(): void {
    this.isLoading = true;
    this.statusMessage = '';

    this.saveGameService.loadGame().subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.statusMessage = '游戏已加载！';
        } else {
          this.statusMessage = '没有找到存档';
        }
        setTimeout(() => this.statusMessage = '', 3000);
      },
      error: (error) => {
        this.isLoading = false;
        this.statusMessage = '加载失败';
        setTimeout(() => this.statusMessage = '', 3000);
      }
    });
  }

  newGame(): void {
    if (confirm('确定要开始新游戏吗？当前进度将被保存。')) {
      // Save current game first
      this.saveGame();
      
      // Reset user ID and reload page
      this.saveGameService.resetUserId();
      window.location.reload();
    }
  }

  toggleAutoSave(): void {
    this.autoSaveEnabled = !this.autoSaveEnabled;
    
    if (this.autoSaveEnabled) {
      this.saveGameService.startAutoSave(1);
      this.statusMessage = '自动保存已开启';
    } else {
      this.saveGameService.stopAutoSave();
      this.statusMessage = '自动保存已关闭';
    }
    
    setTimeout(() => this.statusMessage = '', 3000);
  }
}