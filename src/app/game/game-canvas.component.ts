import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import * as PIXI from 'pixi.js';
import { GameDataService } from '../services/game-data.service';
import { TimeService } from '../services/time.service';
import { Subscription } from 'rxjs';

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
  private playerSprite!: PIXI.Graphics;
  private subscriptions: Subscription[] = [];
  
  private readonly TILE_SIZE = 32;
  private readonly WORLD_WIDTH = 30;
  private readonly WORLD_HEIGHT = 20;

  constructor(
    private gameDataService: GameDataService,
    private timeService: TimeService
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
    this.app.stage.addChild(this.gameContainer);
  }

  private createWorld(): void {
    for (let y = 0; y < this.WORLD_HEIGHT; y++) {
      for (let x = 0; x < this.WORLD_WIDTH; x++) {
        const grass = new PIXI.Graphics();
        grass.rect(0, 0, this.TILE_SIZE, this.TILE_SIZE);
        grass.fill(0x4CAF50);
        grass.stroke({ width: 1, color: 0x2E7D32 });
        grass.x = x * this.TILE_SIZE;
        grass.y = y * this.TILE_SIZE;
        this.gameContainer.addChild(grass);
      }
    }

    this.createPlayer();
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
    });

    this.subscriptions.push(gameStateSub);

    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));
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
    }

    if (newX !== currentState.position.x || newY !== currentState.position.y) {
      this.gameDataService.updatePlayerState({
        position: { x: newX, y: newY },
        movementState: 'walking'
      });
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