import { Injectable } from '@angular/core';
import * as PIXI from 'pixi.js';

@Injectable({
  providedIn: 'root'
})
export class PerformanceService {
  private app: PIXI.Application | null = null;
  private tileContainer: PIXI.Container | null = null;
  private entityContainer: PIXI.Container | null = null;
  private uiContainer: PIXI.Container | null = null;
  
  private cullBounds: PIXI.Rectangle | null = null;
  private visibleTiles: Set<string> = new Set();
  
  constructor() {}

  initializeContainers(app: PIXI.Application): void {
    this.app = app;
    
    // Create layered containers for better performance
    this.tileContainer = new PIXI.Container();
    this.entityContainer = new PIXI.Container();
    this.uiContainer = new PIXI.Container();
    
    // Enable culling for tile container
    this.tileContainer.cullable = true;
    this.entityContainer.cullable = true;
    
    // Add containers to stage in order
    app.stage.addChild(this.tileContainer);
    app.stage.addChild(this.entityContainer);
    app.stage.addChild(this.uiContainer);
  }

  getContainers() {
    return {
      tiles: this.tileContainer,
      entities: this.entityContainer,
      ui: this.uiContainer
    };
  }

  updateCulling(cameraX: number, cameraY: number, screenWidth: number, screenHeight: number): void {
    if (!this.tileContainer || !this.entityContainer) return;
    
    // Define visible area with some padding
    const padding = 100;
    this.cullBounds = new PIXI.Rectangle(
      cameraX - padding,
      cameraY - padding,
      screenWidth + padding * 2,
      screenHeight + padding * 2
    );
    
    // Cull tiles
    this.cullContainer(this.tileContainer);
    
    // Cull entities
    this.cullContainer(this.entityContainer);
  }

  private cullContainer(container: PIXI.Container): void {
    if (!this.cullBounds) return;
    
    container.children.forEach(child => {
      if ('getBounds' in child) {
        const bounds = child.getBounds();
        // Check if child is within visible bounds
        child.visible = this.cullBounds!.x < bounds.x + bounds.width &&
                       this.cullBounds!.x + this.cullBounds!.width > bounds.x &&
                       this.cullBounds!.y < bounds.y + bounds.height &&
                       this.cullBounds!.y + this.cullBounds!.height > bounds.y;
      }
    });
  }

  // Object pooling for frequently created/destroyed objects
  private tilePool: PIXI.Graphics[] = [];
  private poolSize = 100;

  getTileFromPool(): PIXI.Graphics {
    if (this.tilePool.length > 0) {
      return this.tilePool.pop()!;
    }
    return new PIXI.Graphics();
  }

  returnTileToPool(tile: PIXI.Graphics): void {
    tile.clear();
    tile.visible = false;
    if (this.tilePool.length < this.poolSize) {
      this.tilePool.push(tile);
    }
  }

  // Batch rendering optimizations
  enableBatchRendering(): void {
    if (!this.app) return;
    
    // Enable batch rendering by setting container properties
    if (this.tileContainer) {
      this.tileContainer.sortableChildren = false;
    }
    if (this.entityContainer) {
      this.entityContainer.sortableChildren = false;
    }
  }

  // FPS monitoring
  private fps = 0;
  private lastTime = performance.now();
  private frames = 0;

  updateFPS(): number {
    this.frames++;
    const currentTime = performance.now();
    
    if (currentTime >= this.lastTime + 1000) {
      this.fps = Math.round((this.frames * 1000) / (currentTime - this.lastTime));
      this.frames = 0;
      this.lastTime = currentTime;
    }
    
    return this.fps;
  }

  getFPS(): number {
    return this.fps;
  }

  // Texture caching
  private textureCache: Map<string, PIXI.Texture> = new Map();

  getCachedTexture(key: string, createFn: () => PIXI.Texture): PIXI.Texture {
    if (!this.textureCache.has(key)) {
      this.textureCache.set(key, createFn());
    }
    return this.textureCache.get(key)!;
  }

  // Memory management
  clearUnusedTextures(): void {
    // Clear textures not used in the last minute
    const now = Date.now();
    const maxAge = 60000; // 1 minute
    
    // Implementation would track texture usage times
    // and clear old ones to prevent memory leaks
  }

  // Render statistics
  getRenderStats() {
    if (!this.app) return null;
    
    return {
      fps: this.getFPS(),
      drawCalls: (this.app.renderer as any).drawCalls || 0,
      textures: this.textureCache.size,
      visibleTiles: this.visibleTiles.size
    };
  }
}