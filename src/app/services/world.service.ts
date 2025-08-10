import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ITileState, WorldData } from '../models/world.model';
import { GameDataService } from './game-data.service';

@Injectable({
  providedIn: 'root'
})
export class WorldService {
  private worldData: WorldData = {};
  private worldData$ = new BehaviorSubject<WorldData>(this.worldData);
  
  private readonly WORLD_WIDTH = 30;
  private readonly WORLD_HEIGHT = 20;

  constructor(private gameDataService: GameDataService) {
    this.initializeWorld();
    
    this.gameDataService.getGameState().subscribe(state => {
      if (Object.keys(state.worldData).length > 0) {
        this.worldData = state.worldData;
        this.worldData$.next(this.worldData);
      }
    });
  }

  private initializeWorld(): void {
    for (let y = 0; y < this.WORLD_HEIGHT; y++) {
      for (let x = 0; x < this.WORLD_WIDTH; x++) {
        const key = `${x},${y}`;
        this.worldData[key] = {
          position: { x, y },
          type: 'grass',
          isWatered: false
        };
      }
    }
    this.worldData$.next(this.worldData);
    this.gameDataService.updateWorldData(this.worldData);
  }

  getWorldData(): Observable<WorldData> {
    return this.worldData$.asObservable();
  }

  getTile(x: number, y: number): ITileState | null {
    const key = `${x},${y}`;
    return this.worldData[key] || null;
  }

  tillSoil(x: number, y: number): boolean {
    const key = `${x},${y}`;
    const tile = this.worldData[key];
    
    if (!tile) return false;
    
    if (tile.type === 'grass' || tile.type === 'dirt') {
      tile.type = 'tilled_soil';
      tile.isWatered = false;
      this.worldData$.next(this.worldData);
      this.gameDataService.updateWorldData(this.worldData);
      return true;
    }
    
    return false;
  }

  waterTile(x: number, y: number): boolean {
    const key = `${x},${y}`;
    const tile = this.worldData[key];
    
    if (!tile) return false;
    
    if (tile.type === 'tilled_soil' && !tile.isWatered) {
      tile.isWatered = true;
      this.worldData$.next(this.worldData);
      this.gameDataService.updateWorldData(this.worldData);
      return true;
    }
    
    return false;
  }

  chopTree(x: number, y: number): boolean {
    const key = `${x},${y}`;
    const tile = this.worldData[key];
    
    if (!tile) return false;
    
    if (tile.type === 'grass') {
      tile.type = 'dirt';
      this.worldData$.next(this.worldData);
      this.gameDataService.updateWorldData(this.worldData);
      return true;
    }
    
    return false;
  }

  mineTile(x: number, y: number): boolean {
    const key = `${x},${y}`;
    const tile = this.worldData[key];
    
    if (!tile) return false;
    
    if (tile.type === 'stone') {
      tile.type = 'dirt';
      this.worldData$.next(this.worldData);
      this.gameDataService.updateWorldData(this.worldData);
      return true;
    }
    
    return false;
  }

  placeStoneTile(x: number, y: number): boolean {
    const key = `${x},${y}`;
    const tile = this.worldData[key];
    
    if (!tile) return false;
    
    if (tile.type === 'dirt' || tile.type === 'grass') {
      tile.type = 'stone';
      this.worldData$.next(this.worldData);
      this.gameDataService.updateWorldData(this.worldData);
      return true;
    }
    
    return false;
  }
}