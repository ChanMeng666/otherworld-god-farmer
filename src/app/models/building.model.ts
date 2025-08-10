export interface IBuilding {
  id: string;
  typeId: string;
  position: { x: number, y: number };
  size: { width: number, height: number };
}