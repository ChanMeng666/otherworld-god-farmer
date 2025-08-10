import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AudioService } from '../services/audio.service';

@Component({
  selector: 'app-audio-controls',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="audio-controls">
      <button class="mute-btn" (click)="toggleMute()" [title]="isMuted ? '开启声音' : '关闭声音'">
        <span *ngIf="!isMuted">🔊</span>
        <span *ngIf="isMuted">🔇</span>
      </button>
      
      <div class="volume-panel" *ngIf="showVolumePanel">
        <div class="volume-header">
          <h4>🎵 音频设置</h4>
          <button class="close-btn" (click)="showVolumePanel = false">✕</button>
        </div>
        
        <div class="volume-control">
          <label>🎵 音乐音量</label>
          <input 
            type="range" 
            min="0" 
            max="100" 
            [value]="musicVolume * 100"
            (input)="setMusicVolume($event)"
          >
          <span>{{ (musicVolume * 100).toFixed(0) }}%</span>
        </div>
        
        <div class="volume-control">
          <label>🔊 音效音量</label>
          <input 
            type="range" 
            min="0" 
            max="100" 
            [value]="effectsVolume * 100"
            (input)="setEffectsVolume($event)"
          >
          <span>{{ (effectsVolume * 100).toFixed(0) }}%</span>
        </div>

        <div class="test-sounds">
          <button (click)="testSound('success')">测试音效 🔔</button>
        </div>
      </div>
      
      <button class="settings-btn" (click)="showVolumePanel = !showVolumePanel">
        ⚙️
      </button>
    </div>
  `,
  styles: [`
    .audio-controls {
      position: fixed;
      top: 20px;
      right: 20px;
      display: flex;
      gap: 10px;
      z-index: 1500;
    }

    .mute-btn, .settings-btn {
      width: 40px;
      height: 40px;
      background: rgba(0, 0, 0, 0.7);
      border: 2px solid rgba(76, 175, 80, 0.5);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 20px;
      transition: all 0.2s;
      color: white;
    }

    .mute-btn:hover, .settings-btn:hover {
      background: rgba(0, 0, 0, 0.9);
      transform: scale(1.1);
    }

    .volume-panel {
      position: absolute;
      top: 50px;
      right: 0;
      width: 250px;
      background: rgba(20, 20, 20, 0.95);
      border: 2px solid rgba(76, 175, 80, 0.5);
      border-radius: 15px;
      padding: 15px;
      color: white;
    }

    .volume-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    }

    .volume-header h4 {
      margin: 0;
      font-size: 16px;
    }

    .close-btn {
      background: none;
      border: none;
      color: white;
      font-size: 16px;
      cursor: pointer;
      padding: 0;
      width: 25px;
      height: 25px;
    }

    .close-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 5px;
    }

    .volume-control {
      margin-bottom: 15px;
    }

    .volume-control label {
      display: block;
      font-size: 12px;
      margin-bottom: 5px;
      color: #8BC34A;
    }

    .volume-control input[type="range"] {
      width: 70%;
      height: 5px;
      background: rgba(255, 255, 255, 0.2);
      outline: none;
      border-radius: 5px;
    }

    .volume-control input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 15px;
      height: 15px;
      background: #4CAF50;
      cursor: pointer;
      border-radius: 50%;
    }

    .volume-control span {
      margin-left: 10px;
      font-size: 12px;
      color: #FFD700;
    }

    .test-sounds {
      margin-top: 15px;
      text-align: center;
    }

    .test-sounds button {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      color: white;
      padding: 8px 16px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 12px;
      transition: all 0.2s;
    }

    .test-sounds button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
    }
  `]
})
export class AudioControlsComponent implements OnInit {
  isMuted = false;
  showVolumePanel = false;
  musicVolume = 0.3;
  effectsVolume = 0.5;

  constructor(private audioService: AudioService) {}

  ngOnInit(): void {
    this.isMuted = this.audioService.isMutedStatus();
    this.musicVolume = this.audioService.getMusicVolume();
    this.effectsVolume = this.audioService.getEffectsVolume();
    
    // Start background music after a short delay
    setTimeout(() => {
      this.audioService.startBackgroundMusic();
    }, 1000);
  }

  toggleMute(): void {
    this.audioService.toggleMute();
    this.isMuted = this.audioService.isMutedStatus();
  }

  setMusicVolume(event: any): void {
    const volume = event.target.value / 100;
    this.musicVolume = volume;
    this.audioService.setMusicVolume(volume);
  }

  setEffectsVolume(event: any): void {
    const volume = event.target.value / 100;
    this.effectsVolume = volume;
    this.audioService.setEffectsVolume(volume);
  }

  testSound(soundName: string): void {
    this.audioService.playSound(soundName);
  }
}