export interface IItem {
  id: string;
  name: string;
  description: string;
  isStackable: boolean;
}

export interface IInventorySlot {
  item: IItem | null;
  quantity: number;
}