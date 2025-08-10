export type Season = 'Spring' | 'Summer' | 'Autumn' | 'Winter';

export interface ITimeState {
  minute: number;
  hour: number;
  day: number;
  season: Season;
  year: number;
}