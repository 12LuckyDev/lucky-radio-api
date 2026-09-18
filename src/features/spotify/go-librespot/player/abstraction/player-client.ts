import { Logger } from '@nestjs/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { PlayerStatusDTO } from '../dto/player-status.dto';

export abstract class PlayerClient {
  protected readonly logger: Logger;

  private _lastConnectingAttempt: Date = new Date();
  private readonly connectedSubject = new BehaviorSubject<boolean>(false);

  protected readonly connected$ = this.connectedSubject.asObservable();

  constructor(name: string) {
    this.logger = new Logger(name);
  }

  public get connected(): boolean {
    return this.connectedSubject.value;
  }

  public get lastConnectingAttempt(): Date {
    return this._lastConnectingAttempt;
  }

  protected set lastConnectingAttempt(value: Date) {
    this._lastConnectingAttempt = value;
  }

  protected changeConnected(newValue: boolean): void {
    if (this.connectedSubject.value !== newValue) {
      this.connectedSubject.next(newValue);
    }
  }

  abstract get statusUpdate$(): Observable<PlayerStatusDTO>;

  abstract getStatus(): Promise<PlayerStatusDTO>;
  abstract setVolume(volume: number): Promise<true | { error: string }>;
}
