import { Injectable } from '@angular/core';

interface SoundEffect {
  name: string;
  url?: string;
  emoji: string;
  frequency: number; // Hz
  duration: number; // ms
  type: OscillatorType;
}

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private audioContext: AudioContext | null = null;
  private backgroundMusic: OscillatorNode | null = null;
  private isMuted = false;
  private musicVolume = 0.3;
  private effectsVolume = 0.5;

  private soundEffects: Map<string, SoundEffect> = new Map([
    ['till', { name: 'Till Soil', emoji: '🌾', frequency: 150, duration: 200, type: 'sawtooth' }],
    ['plant', { name: 'Plant Seed', emoji: '🌱', frequency: 800, duration: 150, type: 'sine' }],
    ['water', { name: 'Water', emoji: '💧', frequency: 600, duration: 300, type: 'sine' }],
    ['harvest', { name: 'Harvest', emoji: '🌾', frequency: 1000, duration: 200, type: 'triangle' }],
    ['chop', { name: 'Chop Wood', emoji: '🪓', frequency: 200, duration: 150, type: 'square' }],
    ['mine', { name: 'Mine Stone', emoji: '⛏️', frequency: 100, duration: 200, type: 'sawtooth' }],
    ['build', { name: 'Build', emoji: '🔨', frequency: 400, duration: 250, type: 'triangle' }],
    ['pickup', { name: 'Pickup Item', emoji: '📦', frequency: 1200, duration: 100, type: 'sine' }],
    ['talk', { name: 'Talk to NPC', emoji: '💬', frequency: 500, duration: 150, type: 'sine' }],
    ['success', { name: 'Success', emoji: '✅', frequency: 880, duration: 300, type: 'sine' }],
    ['error', { name: 'Error', emoji: '❌', frequency: 200, duration: 400, type: 'sawtooth' }]
  ]);

  constructor() {
    this.initAudioContext();
    this.loadSettings();
  }

  private initAudioContext(): void {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      console.log('Audio system initialized');
    } catch (error) {
      console.error('Web Audio API not supported:', error);
    }
  }

  private loadSettings(): void {
    const muted = localStorage.getItem('audioMuted');
    const musicVol = localStorage.getItem('musicVolume');
    const effectsVol = localStorage.getItem('effectsVolume');

    this.isMuted = muted === 'true';
    this.musicVolume = musicVol ? parseFloat(musicVol) : 0.3;
    this.effectsVolume = effectsVol ? parseFloat(effectsVol) : 0.5;
  }

  private saveSettings(): void {
    localStorage.setItem('audioMuted', this.isMuted.toString());
    localStorage.setItem('musicVolume', this.musicVolume.toString());
    localStorage.setItem('effectsVolume', this.effectsVolume.toString());
  }

  playSound(soundName: string): void {
    if (this.isMuted || !this.audioContext) return;

    const sound = this.soundEffects.get(soundName);
    if (!sound) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.type = sound.type;
      oscillator.frequency.value = sound.frequency;

      gainNode.gain.setValueAtTime(this.effectsVolume, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + sound.duration / 1000);

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + sound.duration / 1000);
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }

  startBackgroundMusic(): void {
    if (this.isMuted || !this.audioContext || this.backgroundMusic) return;

    try {
      // Create a simple melody using multiple oscillators
      const playNote = (frequency: number, startTime: number, duration: number) => {
        const oscillator = this.audioContext!.createOscillator();
        const gainNode = this.audioContext!.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;

        gainNode.gain.setValueAtTime(this.musicVolume * 0.3, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext!.destination);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };

      // Simple repeating melody (C major scale pattern)
      const melody = [
        { freq: 261.63, duration: 0.5 }, // C
        { freq: 293.66, duration: 0.5 }, // D
        { freq: 329.63, duration: 0.5 }, // E
        { freq: 261.63, duration: 0.5 }, // C
        { freq: 329.63, duration: 0.5 }, // E
        { freq: 392.00, duration: 0.5 }, // G
        { freq: 329.63, duration: 1.0 }, // E
      ];

      const playMelody = () => {
        if (this.isMuted || !this.audioContext) return;

        let currentTime = this.audioContext.currentTime;
        melody.forEach(note => {
          playNote(note.freq, currentTime, note.duration);
          currentTime += note.duration;
        });

        // Repeat melody
        setTimeout(() => playMelody(), 4000);
      };

      playMelody();
      console.log('Background music started');
    } catch (error) {
      console.error('Error starting background music:', error);
    }
  }

  stopBackgroundMusic(): void {
    if (this.backgroundMusic) {
      try {
        this.backgroundMusic.stop();
        this.backgroundMusic = null;
      } catch (error) {
        console.error('Error stopping background music:', error);
      }
    }
  }

  toggleMute(): void {
    this.isMuted = !this.isMuted;
    this.saveSettings();
    
    if (this.isMuted) {
      this.stopBackgroundMusic();
    } else {
      this.startBackgroundMusic();
    }
  }

  setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    this.saveSettings();
  }

  setEffectsVolume(volume: number): void {
    this.effectsVolume = Math.max(0, Math.min(1, volume));
    this.saveSettings();
  }

  isMutedStatus(): boolean {
    return this.isMuted;
  }

  getMusicVolume(): number {
    return this.musicVolume;
  }

  getEffectsVolume(): number {
    return this.effectsVolume;
  }
}