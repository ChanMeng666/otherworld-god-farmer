import { Component } from '@angular/core';
import { GameCanvasComponent } from './game/game-canvas.component';
import { PlayerHudComponent } from './components/player-hud.component';
import { ToolWheelComponent } from './components/tool-wheel.component';
import { InventoryPanelComponent } from './components/inventory-panel.component';
import { HelpPanelComponent } from './components/help-panel.component';
import { BuildingPanelComponent } from './components/building-panel.component';
import { SaveMenuComponent } from './components/save-menu.component';
import { AudioControlsComponent } from './components/audio-controls.component';
import { PerformanceMonitorComponent } from './components/performance-monitor.component';
import { EventNotificationComponent } from './components/event-notification.component';
import { DeveloperInfoComponent } from './components/developer-info.component';

@Component({
  selector: 'app-root',
  imports: [GameCanvasComponent, PlayerHudComponent, ToolWheelComponent, InventoryPanelComponent, HelpPanelComponent, BuildingPanelComponent, SaveMenuComponent, AudioControlsComponent, PerformanceMonitorComponent, EventNotificationComponent, DeveloperInfoComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.scss'
})
export class App {
  title = 'Otherworld God-Farmer';
}
