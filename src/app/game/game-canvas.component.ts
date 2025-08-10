import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, OnDestroy, ViewContainerRef, ComponentRef } from '@angular/core';
import * as PIXI from 'pixi.js';
import { GameDataService } from '../services/game-data.service';
import { TimeService } from '../services/time.service';
import { WorldService } from '../services/world.service';
import { InventoryService } from '../services/inventory.service';
import { CropService } from '../services/crop.service';
import { EmojiRendererService } from '../services/emoji-renderer.service';
import { Subscription } from 'rxjs';
import { ToolType } from '../models/player.model';
import { WorldData } from '../models/world.model';
import { ContextMenuComponent, MenuAction } from '../components/context-menu.component';

@Component({
  selector: 'app-game-canvas',
  standalone: true,
  imports: [ContextMenuComponent],
  template: `
    <div class="game-container">
      <canvas #gameCanvas></canvas>
      <app-context-menu #contextMenu (actionSelected)="handleMenuAction($event)"></app-context-menu>
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
  @ViewChild('contextMenu', { static: false }) contextMenu!: ContextMenuComponent;
  
  private app!: PIXI.Application;
  private gameContainer!: PIXI.Container;
  private worldContainer!: PIXI.Container;
  private playerSprite!: PIXI.Container;
  private tileSprites: Map<string, PIXI.Container> = new Map();
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
    private cropService: CropService,
    private emojiRenderer: EmojiRendererService
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
    const tile = new PIXI.Container();
    tile.x = x * this.TILE_SIZE;
    tile.y = y * this.TILE_SIZE;
    
    this.updateTileGraphics(tile, type, false);
    
    this.tileSprites.set(key, tile);
    this.worldContainer.addChild(tile);
  }

  private updateTileGraphics(tile: PIXI.Container, type: string, isWatered: boolean): void {
    const emoji = this.emojiRenderer.getTileEmoji(type, isWatered);
    const bgColor = this.emojiRenderer.getTileBackgroundColor(type, isWatered);
    this.emojiRenderer.updateTileEmoji(tile, emoji, bgColor);
  }

  private subscribeToWorldChanges(): void {
    const worldSub = this.worldService.getWorldData().subscribe(worldData => {
      Object.entries(worldData).forEach(([key, tileState]) => {
        const tile = this.tileSprites.get(key);
        if (tile) {
          this.updateTileGraphics(tile, tileState.type, tileState.isWatered);
          
          tile.removeChildren();
          
          if (tileState.crop) {
            const cropEmoji = this.emojiRenderer.getCropEmoji(
              tileState.crop.itemId, 
              tileState.crop.growthStage, 
              tileState.crop.maxGrowthStage
            );
            const cropSprite = this.emojiRenderer.createEmojiSprite(cropEmoji, 20);
            cropSprite.x = this.TILE_SIZE / 2;
            cropSprite.y = this.TILE_SIZE / 2;
            tile.addChild(cropSprite);
          }
        }
      });
    });
    this.subscriptions.push(worldSub);
  }


  private createPlayer(): void {
    const playerContainer = new PIXI.Container();
    
    const playerEmoji = this.emojiRenderer.getPlayerEmoji();
    const playerText = this.emojiRenderer.createEmojiSprite(playerEmoji, 28);
    playerText.x = this.TILE_SIZE / 2;
    playerText.y = this.TILE_SIZE / 2;
    
    playerContainer.addChild(playerText);
    playerContainer.x = 10 * this.TILE_SIZE;
    playerContainer.y = 10 * this.TILE_SIZE;
    
    this.playerSprite = playerContainer;
    this.gameContainer.addChild(this.playerSprite);
  }

  private setupEventListeners(): void {
    const gameStateSub = this.gameDataService.getGameState().subscribe(state => {
      if (this.playerSprite && state.playerState) {
        this.playerSprite.x = state.playerState.position.x * this.TILE_SIZE;
        this.playerSprite.y = state.playerState.position.y * this.TILE_SIZE;
      }
      this.currentTool = state.toolState.currentTool;
    });

    this.subscriptions.push(gameStateSub);

    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));
    
    this.app.stage.eventMode = 'static';
    this.app.stage.on('pointerdown', this.handleClick.bind(this));
    this.app.stage.on('rightdown', this.handleRightClick.bind(this));
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
      this.smartAction(x, y);
    } else {
      this.movePlayerTo(x, y);
    }
  }

  private smartAction(x: number, y: number): void {
    const tile = this.worldService.getTile(x, y);
    if (!tile) return;
    
    if (tile.crop && tile.crop.growthStage >= tile.crop.maxGrowthStage) {
      this.plantOrHarvest();
    } else if (tile.crop && !tile.isWatered) {
      this.currentTool = 'watering_can';
      this.useTool(x, y);
    } else if (tile.type === 'grass') {
      this.currentTool = 'hoe';
      this.useTool(x, y);
    } else if (tile.type === 'tilled_soil' && !tile.crop) {
      this.plantOrHarvest();
    } else if (tile.type === 'tilled_soil' && !tile.isWatered) {
      this.currentTool = 'watering_can';
      this.useTool(x, y);
    } else if (tile.type === 'stone') {
      this.currentTool = 'pickaxe';
      this.useTool(x, y);
    }
  }

  private movePlayerTo(targetX: number, targetY: number): void {
    if (targetX < 0 || targetX >= this.WORLD_WIDTH || targetY < 0 || targetY >= this.WORLD_HEIGHT) {
      return;
    }
    
    const playerState = this.gameDataService['gameState'].playerState;
    const startX = playerState.position.x;
    const startY = playerState.position.y;
    
    const path = this.findPath(startX, startY, targetX, targetY);
    
    if (path.length > 0) {
      this.animateMovement(path);
    }
  }

  private findPath(startX: number, startY: number, targetX: number, targetY: number): {x: number, y: number}[] {
    const path: {x: number, y: number}[] = [];
    
    let currentX = startX;
    let currentY = startY;
    
    while (currentX !== targetX || currentY !== targetY) {
      if (currentX < targetX) currentX++;
      else if (currentX > targetX) currentX--;
      
      if (currentY < targetY) currentY++;
      else if (currentY > targetY) currentY--;
      
      path.push({x: currentX, y: currentY});
    }
    
    return path;
  }

  private animateMovement(path: {x: number, y: number}[]): void {
    if (path.length === 0) return;
    
    const step = path.shift();
    if (step) {
      this.gameDataService.updatePlayerState({
        position: { x: step.x, y: step.y },
        movementState: 'walking'
      });
      
      setTimeout(() => {
        if (path.length > 0) {
          this.animateMovement(path);
        } else {
          this.gameDataService.updatePlayerState({
            movementState: 'idle'
          });
        }
      }, 150);
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

  private handleRightClick(event: PIXI.FederatedPointerEvent): void {
    event.preventDefault();
    
    const x = Math.floor(event.global.x / this.TILE_SIZE);
    const y = Math.floor(event.global.y / this.TILE_SIZE);
    const tile = this.worldService.getTile(x, y);
    
    if (!tile) return;
    
    const actions = this.getContextMenuActions(tile.type, tile.crop !== undefined);
    
    const rect = this.gameCanvas.nativeElement.getBoundingClientRect();
    const menuX = event.client.x;
    const menuY = event.client.y;
    
    this.contextMenu.show(menuX, menuY, actions);
  }

  private getContextMenuActions(tileType: string, hasCrop: boolean): MenuAction[] {
    const actions: MenuAction[] = [];
    
    switch(tileType) {
      case 'grass':
        actions.push(
          { id: 'till', label: '耕地', icon: '🌾', enabled: true },
          { id: 'chop', label: '砍伐', icon: '🪓', enabled: true },
          { id: 'stone', label: '放置石块', icon: '🪨', enabled: true }
        );
        break;
      case 'dirt':
        actions.push(
          { id: 'till', label: '耕地', icon: '🌾', enabled: true },
          { id: 'grass', label: '恢复草地', icon: '🌱', enabled: true }
        );
        break;
      case 'tilled_soil':
        if (hasCrop) {
          actions.push(
            { id: 'water', label: '浇水', icon: '💧', enabled: true },
            { id: 'harvest', label: '收获', icon: '🌾', enabled: true }
          );
        } else {
          actions.push(
            { id: 'plant', label: '种植...', icon: '🌱', enabled: true },
            { id: 'water', label: '浇水', icon: '💧', enabled: true },
            { id: 'grass', label: '恢复草地', icon: '🌿', enabled: true }
          );
        }
        break;
      case 'stone':
        actions.push(
          { id: 'mine', label: '挖掘', icon: '⛏️', enabled: true },
          { id: 'remove', label: '移除', icon: '❌', enabled: true }
        );
        break;
    }
    
    return actions;
  }

  handleMenuAction(actionId: string): void {
    const playerState = this.gameDataService['gameState'].playerState;
    
    switch(actionId) {
      case 'till':
        this.currentTool = 'hoe';
        this.useTool();
        break;
      case 'water':
        this.currentTool = 'watering_can';
        this.useTool();
        break;
      case 'chop':
        this.currentTool = 'axe';
        this.useTool();
        break;
      case 'mine':
        this.currentTool = 'pickaxe';
        this.useTool();
        break;
      case 'stone':
        this.currentTool = 'hammer';
        this.useTool();
        break;
      case 'plant':
        this.showSeedSelectionPanel();
        break;
      case 'harvest':
        this.plantOrHarvest();
        break;
    }
  }

  private showSeedSelectionPanel(): void {
    // Will be implemented with seed selection panel
    this.plantOrHarvest();
  }
}