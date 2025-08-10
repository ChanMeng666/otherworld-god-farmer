import { ICropState } from './crop.model';

export interface ITileState {
  position: { x: number, y: number };
  type: 'dirt' | 'grass' | 'water' | 'stone' | 'tilled_soil' | 'tree';
  isWatered: boolean;
  crop?: ICropState;
  buildingId?: string;
  resource?: { type: string, amount: number };
}

export type WorldData = Record<string, ITileState>;