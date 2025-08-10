import { Component } from '@angular/core';
import { GameCanvasComponent } from './game/game-canvas.component';
import { PlayerHudComponent } from './components/player-hud.component';

@Component({
  selector: 'app-root',
  imports: [GameCanvasComponent, PlayerHudComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.scss'
})
export class App {
  title = 'Otherworld God-Farmer';
}
