import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import * as PIXI from 'pixi.js';
import { GameDataService } from '../services/game-data.service';
import { TimeService } from '../services/time.service';
import { WorldService } from '../services/world.service';
import { InventoryService } from '../services/inventory.service';
import { CropService } from '../services/crop.service';
import { Subscription } from 'rxjs';
import { ToolType } from '../models/player.model';
import { WorldData } from '../models/world.model';

@Component({
  selector: 'app-game-canvas',
  standalone: true,
  template: `
    <div class="game-container">
      <canvas #gameCanvas></canvas>
    </div>
  `,
  styles: [`
    .game-container {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #2c3e50;
    }
    canvas {
      display: block;
    }
  `]
})
export class GameCanvasComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('gameCanvas', { static: false }) gameCanvas!: ElementRef<HTMLCanvasElement>;
  
  private app!: PIXI.Application;
  private gameContainer!: PIXI.Container;
  private worldContainer!: PIXI.Container;
  private playerSprite!: PIXI.Graphics;
  private tileSprites: Map<string, PIXI.Graphics> = new Map();
  private subscriptions: Subscription[] = [];
  private currentTool: ToolType = 'hoe';
  
  private readonly TILE_SIZE = 32;
  private readonly WORLD_WIDTH = 30;
  private readonly WORLD_HEIGHT = 20;

  constructor(
    private gameDataService: GameDataService,
    private timeService: TimeService,
    private worldService: WorldService,
    private inventoryService: InventoryService,
    private cropService: CropService
  ) {}

  ngOnInit(): void {
    console.log('GameCanvasComponent initialized');
  }

  async ngAfterViewInit(): Promise<void> {
    await this.initPixi();
    this.createWorld();
    this.setupEventListeners();
    this.startGameLoop();
    
    this.timeService.startTime();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.timeService.stopTime();
    if (this.app) {
      this.app.destroy(true);
    }
  }

  private async initPixi(): Promise<void> {
    this.app = new PIXI.Application();
    
    await this.app.init({
      width: this.WORLD_WIDTH * this.TILE_SIZE,
      height: this.WORLD_HEIGHT * this.TILE_SIZE,
      backgroundColor: 0x87CEEB,
      view: this.gameCanvas.nativeElement,
      antialias: false,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true
    });

    this.gameContainer = new PIXI.Container();
    this.worldContainer = new PIXI.Container();
    this.app.stage.addChild(this.gameContainer);
    this.gameContainer.addChild(this.worldContainer);
  }

  private createWorld(): void {
    for (let y = 0; y < this.WORLD_HEIGHT; y++) {
      for (let x = 0; x < this.WORLD_WIDTH; x++) {
        this.createTileSprite(x, y, 'grass');
      }
    }

    this.createPlayer();
    this.subscribeToWorldChanges();
  }

  private createTileSprite(x: number, y: number, type: string): void {
    const key = `${x},${y}`;
    const tile = new PIXI.Graphics();
    tile.x = x * this.TILE_SIZE;
    tile.y = y * this.TILE_SIZE;
    
    this.updateTileGraphics(tile, type, false);
    
    this.tileSprites.set(key, tile);
    this.worldContainer.addChild(tile);
  }

  private updateTileGraphics(tile: PIXI.Graphics, type: string, isWatered: boolean): void {
    tile.clear();
    tile.rect(0, 0, this.TILE_SIZE, this.TILE_SIZE);
    
    switch(type) {
      case 'grass':
        tile.fill(0x4CAF50);
        break;
      case 'dirt':
        tile.fill(0x8B7355);
        break;
      case 'tilled_soil':
        tile.fill(isWatered ? 0x4A3C28 : 0x6B5D54);
        break;
      case 'stone':
        tile.fill(0x808080);
        break;
      case 'water':
        tile.fill(0x4A90E2);
        break;
      default:
        tile.fill(0x4CAF50);
    }
    
    tile.stroke({ width: 1, color: 0x2E7D32 });
  }

  private subscribeToWorldChanges(): void {
    const worldSub = this.worldService.getWorldData().subscribe(worldData => {
      Object.entries(worldData).forEach(([key, tileState]) => {
        const tile = this.tileSprites.get(key);
        if (tile) {
          this.updateTileGraphics(tile, tileState.type, tileState.isWatered);
          
          tile.removeChildren();
          
          if (tileState.crop) {
            const cropSprite = new PIXI.Graphics();
            const cropSize = 16;
            const offset = (this.TILE_SIZE - cropSize) / 2;
            
            cropSprite.x = offset;
            cropSprite.y = offset;
            
            this.drawCrop(cropSprite, tileState.crop.itemId, tileState.crop.growthStage, tileState.crop.maxGrowthStage);
            tile.addChild(cropSprite);
          }
        }
      });
    });
    this.subscriptions.push(worldSub);
  }

  private drawCrop(sprite: PIXI.Graphics, cropId: string, stage: number, maxStage: number): void {
    sprite.clear();
    
    const progress = stage / maxStage;
    const size = 8 + progress * 8;
    
    if (stage === 0) {
      sprite.circle(8, 8, 2);
      sprite.fill(0x7CB342);
    } else if (stage < maxStage) {
      sprite.rect(8 - size/2, 16 - size, size, size);
      sprite.fill(0x7CB342);
    } else {
      const cropColors: Record<string, number> = {
        'turnip_seed': 0xE91E63,
        'potato_seed': 0x8D6E63,
        'carrot_seed': 0xFF6F00,
        'wheat_seed': 0xFFD54F
      };
      sprite.rect(0, 0, 16, 16);
      sprite.fill(cropColors[cropId] || 0x4CAF50);
    }
  }

  private createPlayer(): void {
    const playerGraphics = new PIXI.Graphics();
    playerGraphics.rect(0, 0, this.TILE_SIZE - 4, this.TILE_SIZE - 4);
    playerGraphics.fill(0xFF6B6B);
    playerGraphics.stroke({ width: 2, color: 0xC44569 });
    playerGraphics.x = 10 * this.TILE_SIZE + 2;
    playerGraphics.y = 10 * this.TILE_SIZE + 2;
    this.playerSprite = playerGraphics;
    this.gameContainer.addChild(this.playerSprite);
  }

  private setupEventListeners(): void {
    const gameStateSub = this.gameDataService.getGameState().subscribe(state => {
      if (this.playerSprite && state.playerState) {
        this.playerSprite.x = state.playerState.position.x * this.TILE_SIZE + 2;
        this.playerSprite.y = state.playerState.position.y * this.TILE_SIZE + 2;
      }
      this.currentTool = state.toolState.currentTool;
    });

    this.subscriptions.push(gameStateSub);

    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));
    
    this.app.stage.eventMode = 'static';
    this.app.stage.on('pointerdown', this.handleClick.bind(this));
  }

  private handleKeyDown(event: KeyboardEvent): void {
    const currentState = this.gameDataService['gameState'].playerState;
    let newX = currentState.position.x;
    let newY = currentState.position.y;

    switch(event.key) {
      case 'ArrowUp':
      case 'w':
        newY = Math.max(0, newY - 1);
        break;
      case 'ArrowDown':
      case 's':
        newY = Math.min(this.WORLD_HEIGHT - 1, newY + 1);
        break;
      case 'ArrowLeft':
      case 'a':
        newX = Math.max(0, newX - 1);
        break;
      case 'ArrowRight':
      case 'd':
        newX = Math.min(this.WORLD_WIDTH - 1, newX + 1);
        break;
      case ' ':
        event.preventDefault();
        this.useTool();
        return;
      case 'e':
      case 'E':
        event.preventDefault();
        this.plantOrHarvest();
        return;
    }

    if (newX !== currentState.position.x || newY !== currentState.position.y) {
      this.gameDataService.updatePlayerState({
        position: { x: newX, y: newY },
        movementState: 'walking'
      });
    }
  }

  private handleClick(event: PIXI.FederatedPointerEvent): void {
    const x = Math.floor(event.global.x / this.TILE_SIZE);
    const y = Math.floor(event.global.y / this.TILE_SIZE);
    
    const playerState = this.gameDataService['gameState'].playerState;
    const distance = Math.abs(x - playerState.position.x) + Math.abs(y - playerState.position.y);
    
    if (distance <= 1) {
      this.useTool(x, y);
    }
  }

  private useTool(targetX?: number, targetY?: number): void {
    const playerState = this.gameDataService['gameState'].playerState;
    const stamina = playerState.stamina;
    
    if (stamina.current < 5) {
      console.log('体力不足！');
      return;
    }
    
    let x = targetX ?? playerState.position.x;
    let y = targetY ?? playerState.position.y;
    
    let success = false;
    
    switch(this.currentTool) {
      case 'hoe':
        success = this.worldService.tillSoil(x, y);
        break;
      case 'watering_can':
        success = this.worldService.waterTile(x, y);
        break;
      case 'axe':
        success = this.worldService.chopTree(x, y);
        break;
      case 'pickaxe':
        success = this.worldService.mineTile(x, y);
        break;
      case 'hammer':
        success = this.worldService.placeStoneTile(x, y);
        break;
    }
    
    if (success) {
      this.gameDataService.updatePlayerState({
        stamina: { 
          current: Math.max(0, stamina.current - 5), 
          max: stamina.max 
        },
        movementState: 'acting'
      });
      
      setTimeout(() => {
        this.gameDataService.updatePlayerState({
          movementState: 'idle'
        });
      }, 200);
    }
  }

  private plantOrHarvest(): void {
    const playerState = this.gameDataService['gameState'].playerState;
    const x = playerState.position.x;
    const y = playerState.position.y;
    const tile = this.worldService.getTile(x, y);
    
    if (!tile) return;
    
    if (tile.crop && tile.crop.growthStage >= tile.crop.maxGrowthStage) {
      const harvestedItem = this.cropService.harvestCrop(x, y);
      if (harvestedItem) {
        this.inventoryService.addItem(harvestedItem, Math.floor(Math.random() * 3) + 1);
        console.log(`收获了 ${harvestedItem.name}!`);
      }
    } else if (tile.type === 'tilled_soil' && !tile.crop) {
      const selectedItem = this.inventoryService.getSelectedItem();
      if (selectedItem && selectedItem.item && selectedItem.item.id.endsWith('_seed')) {
        const success = this.cropService.plantSeed(x, y, selectedItem.item.id);
        if (success) {
          this.inventoryService.useSelectedItem();
          console.log(`种植了 ${selectedItem.item.name}!`);
        }
      }
    }
  }

  private handleKeyUp(event: KeyboardEvent): void {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(event.key)) {
      this.gameDataService.updatePlayerState({
        movementState: 'idle'
      });
    }
  }

  private startGameLoop(): void {
    this.app.ticker.add(() => {
      // Game update logic will go here
    });
  }
}