import { Component } from '@angular/core';
import { GameCanvasComponent } from './game/game-canvas.component';
import { PlayerHudComponent } from './components/player-hud.component';
import { ToolWheelComponent } from './components/tool-wheel.component';
import { InventoryPanelComponent } from './components/inventory-panel.component';
import { HelpPanelComponent } from './components/help-panel.component';

@Component({
  selector: 'app-root',
  imports: [GameCanvasComponent, PlayerHudComponent, ToolWheelComponent, InventoryPanelComponent, HelpPanelComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.scss'
})
export class App {
  title = 'Otherworld God-Farmer';
}
