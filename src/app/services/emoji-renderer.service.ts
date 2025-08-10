import { Injectable } from '@angular/core';
import * as PIXI from 'pixi.js';

@Injectable({
  providedIn: 'root'
})
export class EmojiRendererService {
  private emojiTextures: Map<string, PIXI.Texture> = new Map();

  getTileEmoji(tileType: string, isWatered: boolean = false): string {
    const tileEmojis: Record<string, string> = {
      'grass': '🌱',
      'dirt': '🟫',
      'tilled_soil': isWatered ? '🟤' : '🟫',
      'stone': '🪨',
      'water': '💧',
      'tree': '🌳'
    };
    return tileEmojis[tileType] || '🌱';
  }

  getCropEmoji(cropId: string, growthStage: number, maxStage: number): string {
    const progress = growthStage / maxStage;
    
    if (growthStage === 0) {
      return '🌰'; // Seed
    } else if (progress < 0.33) {
      return '🌱'; // Sprout
    } else if (progress < 0.66) {
      return '🌿'; // Growing
    } else if (progress < 1) {
      return '🍀'; // Almost ready
    } else {
      // Mature crop
      const cropEmojis: Record<string, string> = {
        'turnip_seed': '🥬',
        'potato_seed': '🥔',
        'carrot_seed': '🥕',
        'wheat_seed': '🌾'
      };
      return cropEmojis[cropId] || '🌾';
    }
  }

  getPlayerEmoji(): string {
    return '🧑‍🌾';
  }

  getToolEmoji(toolType: string): string {
    const toolEmojis: Record<string, string> = {
      'hoe': '🌾',
      'axe': '🪓',
      'pickaxe': '⛏️',
      'watering_can': '💧',
      'hammer': '🔨',
      'fishing_rod': '🎣'
    };
    return toolEmojis[toolType] || '🔧';
  }

  createEmojiSprite(emoji: string, size: number = 32): PIXI.Text {
    const style = new PIXI.TextStyle({
      fontFamily: 'Arial, sans-serif',
      fontSize: size,
      align: 'center'
    });
    
    const text = new PIXI.Text({ text: emoji, style });
    text.anchor.set(0.5);
    
    return text;
  }

  createTileWithEmoji(emoji: string, tileSize: number = 32): PIXI.Container {
    const container = new PIXI.Container();
    
    // Background
    const bg = new PIXI.Graphics();
    bg.rect(0, 0, tileSize, tileSize);
    
    // Set background color based on emoji type
    if (emoji === '🌱') {
      bg.fill(0x90EE90); // Light green for grass
    } else if (emoji === '🟫' || emoji === '🟤') {
      bg.fill(0x8B7355); // Brown for dirt
    } else if (emoji === '🪨') {
      bg.fill(0xA9A9A9); // Gray for stone
    } else if (emoji === '💧') {
      bg.fill(0x87CEEB); // Light blue for water
    } else {
      bg.fill(0xF0F0F0); // Default light gray
    }
    
    container.addChild(bg);
    
    // Emoji text
    const emojiText = this.createEmojiSprite(emoji, tileSize * 0.6);
    emojiText.x = tileSize / 2;
    emojiText.y = tileSize / 2;
    container.addChild(emojiText);
    
    return container;
  }

  updateTileEmoji(container: PIXI.Container, emoji: string, bgColor: number = 0xF0F0F0): void {
    // Clear existing children
    container.removeChildren();
    
    const tileSize = 32;
    
    // Recreate background
    const bg = new PIXI.Graphics();
    bg.rect(0, 0, tileSize, tileSize);
    bg.fill(bgColor);
    bg.stroke({ width: 1, color: 0x2E7D32 });
    container.addChild(bg);
    
    // Add emoji
    const emojiText = this.createEmojiSprite(emoji, tileSize * 0.6);
    emojiText.x = tileSize / 2;
    emojiText.y = tileSize / 2;
    container.addChild(emojiText);
  }

  getTileBackgroundColor(tileType: string, isWatered: boolean = false): number {
    const colors: Record<string, number> = {
      'grass': 0x90EE90,
      'dirt': 0x8B7355,
      'tilled_soil': isWatered ? 0x4A3C28 : 0x6B5D54,
      'stone': 0xA9A9A9,
      'water': 0x87CEEB,
      'tree': 0x228B22
    };
    return colors[tileType] || 0xF0F0F0;
  }
}