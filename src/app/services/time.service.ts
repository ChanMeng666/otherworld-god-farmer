import { Injectable } from '@angular/core';
import { Subject, interval, Subscription } from 'rxjs';
import { ITimeState, Season } from '../models/time.model';
import { GameDataService } from './game-data.service';

@Injectable({
  providedIn: 'root'
})
export class TimeService {
  private timeState: ITimeState = {
    minute: 0,
    hour: 6,
    day: 1,
    season: 'Spring',
    year: 1
  };

  private timeInterval: Subscription | null = null;
  private isPaused = false;

  public onMinuteChange = new Subject<ITimeState>();
  public onHourChange = new Subject<ITimeState>();
  public onDayChange = new Subject<ITimeState>();
  public onSeasonChange = new Subject<ITimeState>();

  constructor(private gameDataService: GameDataService) {
    this.gameDataService.getGameState().subscribe(state => {
      this.timeState = state.timeState;
    });
  }

  startTime(): void {
    if (this.timeInterval) {
      return;
    }

    this.timeInterval = interval(1000).subscribe(() => {
      if (!this.isPaused) {
        this.advanceTime(10);
      }
    });
  }

  stopTime(): void {
    if (this.timeInterval) {
      this.timeInterval.unsubscribe();
      this.timeInterval = null;
    }
  }

  pauseTime(): void {
    this.isPaused = true;
  }

  resumeTime(): void {
    this.isPaused = false;
  }

  private advanceTime(minutes: number): void {
    const oldHour = this.timeState.hour;
    const oldDay = this.timeState.day;
    const oldSeason = this.timeState.season;

    this.timeState.minute += minutes;

    while (this.timeState.minute >= 60) {
      this.timeState.minute -= 60;
      this.timeState.hour++;

      if (this.timeState.hour > 26) {
        this.timeState.hour = 6;
        this.timeState.day++;

        if (this.timeState.day > 28) {
          this.timeState.day = 1;
          this.timeState.season = this.getNextSeason(this.timeState.season);

          if (this.timeState.season === 'Spring') {
            this.timeState.year++;
          }

          if (oldSeason !== this.timeState.season) {
            this.onSeasonChange.next(this.timeState);
          }
        }

        if (oldDay !== this.timeState.day) {
          this.onDayChange.next(this.timeState);
        }
      }

      if (oldHour !== this.timeState.hour) {
        this.onHourChange.next(this.timeState);
      }
    }

    this.onMinuteChange.next(this.timeState);
    this.gameDataService.updateTimeState(this.timeState);
  }

  private getNextSeason(currentSeason: Season): Season {
    const seasons: Season[] = ['Spring', 'Summer', 'Autumn', 'Winter'];
    const currentIndex = seasons.indexOf(currentSeason);
    return seasons[(currentIndex + 1) % seasons.length];
  }

  getTimeState(): ITimeState {
    return { ...this.timeState };
  }
}