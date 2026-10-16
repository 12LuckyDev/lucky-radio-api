import { Logger } from '@nestjs/common';
import { BehaviorSubject } from 'rxjs';
import { CommandResult } from '../../command-result';
import { PlayerState } from '../models/player-state';

export abstract class PlayerClient {
  protected readonly logger: Logger;

  private readonly connectedSubject = new BehaviorSubject<boolean>(false);
  public readonly connected$ = this.connectedSubject.asObservable();

  private readonly volumeSubject = new BehaviorSubject<number>(0);
  public readonly volume$ = this.volumeSubject.asObservable();

  private readonly stateSubject = new BehaviorSubject<PlayerState>('stop');
  public readonly state$ = this.stateSubject.asObservable();

  constructor(name: string) {
    this.logger = new Logger(name);
  }

  protected changeConnected(newValue: boolean): void {
    if (this.connectedSubject.value !== newValue) {
      this.connectedSubject.next(newValue);
    }
  }

  protected changeVolume(newValue: number): void {
    if (this.volumeSubject.value !== newValue) {
      this.volumeSubject.next(newValue);
    }
  }

  protected changeState(newValue: PlayerState): void {
    if (this.stateSubject.value !== newValue) {
      this.stateSubject.next(newValue);
    }
  }

  abstract getState(): Promise<PlayerState>;
  abstract getVolume(): Promise<number | null>;
  abstract setVolume(volume: number): Promise<CommandResult>;
  abstract forceStop(): Promise<void>;
}
