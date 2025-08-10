import { ICropState } from './crop.model';

export interface ITileState {
  position: { x: number, y: number };
  type: 'dirt' | 'grass' | 'water' | 'stone' | 'tilled_soil';
  isWatered: boolean;
  crop?: ICropState;
  buildingId?: string;
}

export type WorldData = Record<string, ITileState>;