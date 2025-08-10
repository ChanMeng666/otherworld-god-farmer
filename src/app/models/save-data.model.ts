import { IPlayerState, IAllPurposeToolState } from './player.model';
import { WorldData } from './world.model';
import { IInventorySlot } from './inventory.model';
import { ITimeState } from './time.model';
import { IBuilding } from './building.model';
import { INpcState } from './npc.model';

export interface ISaveData {
  playerState: IPlayerState;
  toolState: IAllPurposeToolState;
  worldData: WorldData;
  inventory: IInventorySlot[];
  timeState: ITimeState;
  buildings: IBuilding[];
  npcs: INpcState[];
}