import { Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
// import { CommandResult } from '../../command-result';
import { PlayerState } from '../models/player-state';

export abstract class PlayerService {
  protected readonly name: string;
  protected readonly logger: Logger;

  constructor(name: string) {
    this.name = name;
    this.logger = new Logger(name);
  }

  abstract get volume$(): Observable<number>;
  abstract get state$(): Observable<PlayerState>;

  //   abstract getState(): Promise<PlayerState>;

  //   abstract getVolume(): Promise<number | null>;
  //   abstract setVolume(volume: number): Promise<CommandResult>;
  //   abstract forceStop(): Promise<void>;
}
