export interface INpcState {
  id: string;
  name: string;
  position: { x: number, y: number };
  relationshipLevel: number;
  schedule: Record<string, string>;
  dialogueTreeId: string;
}