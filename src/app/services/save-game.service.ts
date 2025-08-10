import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, interval } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { GameDataService } from './game-data.service';
import { ISaveData } from '../models/save-data.model';

@Injectable({
  providedIn: 'root'
})
export class SaveGameService {
  private apiUrl = 'http://localhost:3000/api/game';
  private userId = 'player_' + Date.now(); // Generate unique player ID
  private autoSaveInterval: any;
  private lastSaveTime = 0;

  constructor(
    private http: HttpClient,
    private gameDataService: GameDataService
  ) {
    // Load user ID from localStorage if exists
    const savedUserId = localStorage.getItem('userId');
    if (savedUserId) {
      this.userId = savedUserId;
    } else {
      localStorage.setItem('userId', this.userId);
    }
  }

  saveGame(): Observable<any> {
    const saveData = this.gameDataService['gameState'];
    const currentTime = Date.now();
    
    // Prevent saving too frequently
    if (currentTime - this.lastSaveTime < 1000) {
      return of({ success: true, message: 'Save skipped (too frequent)' });
    }

    this.lastSaveTime = currentTime;

    return this.http.post(`${this.apiUrl}/save`, {
      userId: this.userId,
      saveData: saveData
    }).pipe(
      tap(() => {
        console.log('游戏已保存！');
        this.showSaveNotification('游戏已保存 ✅');
      }),
      catchError(error => {
        console.error('保存失败:', error);
        this.showSaveNotification('保存失败 ❌');
        return of({ success: false, error });
      })
    );
  }

  loadGame(): Observable<any> {
    return this.http.get(`${this.apiUrl}/load?userId=${this.userId}`).pipe(
      tap((response: any) => {
        if (response.success && response.saveData) {
          this.gameDataService.loadGame(response.saveData);
          console.log('游戏已加载！');
          this.showSaveNotification('游戏已加载 ✅');
        }
      }),
      catchError(error => {
        console.error('加载失败:', error);
        this.showSaveNotification('没有找到存档 ℹ️');
        return of({ success: false, error });
      })
    );
  }

  startAutoSave(intervalMinutes: number = 1): void {
    this.stopAutoSave();
    
    // Convert minutes to milliseconds
    const intervalMs = intervalMinutes * 60 * 1000;
    
    this.autoSaveInterval = interval(intervalMs).subscribe(() => {
      this.saveGame().subscribe();
    });
    
    console.log(`自动保存已启动 (每${intervalMinutes}分钟)`);
  }

  stopAutoSave(): void {
    if (this.autoSaveInterval) {
      this.autoSaveInterval.unsubscribe();
      this.autoSaveInterval = null;
    }
  }

  private showSaveNotification(message: string): void {
    // Create notification element
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 10px 20px;
      border-radius: 10px;
      z-index: 10000;
      animation: fadeInOut 3s ease;
    `;

    // Add animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeInOut {
        0% { opacity: 0; transform: translateY(-20px); }
        20% { opacity: 1; transform: translateY(0); }
        80% { opacity: 1; transform: translateY(0); }
        100% { opacity: 0; transform: translateY(-20px); }
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    // Remove after animation
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  getUserId(): string {
    return this.userId;
  }

  resetUserId(): void {
    this.userId = 'player_' + Date.now();
    localStorage.setItem('userId', this.userId);
  }
}