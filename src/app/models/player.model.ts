export interface IPlayerState {
  position: { x: number, y: number };
  stamina: { current: number, max: number };
  movementState: 'idle' | 'walking' | 'running' | 'acting';
}

export type ToolType = 'hoe' | 'axe' | 'pickaxe' | 'watering_can' | 'hammer' | 'fishing_rod';

export interface IAllPurposeToolState {
  currentTool: ToolType;
  levels: Record<ToolType, number>;
  abilities: Record<ToolType, string[]>;
}