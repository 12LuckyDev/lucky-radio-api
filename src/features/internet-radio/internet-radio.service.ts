import { Injectable } from '@nestjs/common';
import {
  PlayerService,
  PlayerState,
  type CommandResult,
  type PlayerStateDTO,
} from '../shared';
import { MpdClient } from './mpd/mpd.client';
import { map, Observable } from 'rxjs';
import { PlayersRegistry } from '../global/players-registry';

@Injectable()
export class InternetRadioService extends PlayerService {
  constructor(
    private readonly mpdClient: MpdClient,
    private readonly playersRegistry: PlayersRegistry,
  ) {
    super('i-radio');
    this.playersRegistry.register(this.name, this);
  }

  public get connected$(): Observable<boolean> {
    return this.mpdClient.mdpStatus$.pipe(map((status) => status !== null));
  }

  public get volume$(): Observable<number> {
    return this.mpdClient.mdpStatus$.pipe(map((status) => status?.volume ?? 0));
  }

  public get state$(): Observable<PlayerState> {
    return this.mpdClient.mdpStatus$.pipe(
      map((status) => status?.state ?? 'stop'),
    );
  }

  public async playStream(url: string): Promise<CommandResult> {
    return this.mpdClient.playStream(url);
  }

  public async stopStream(): Promise<CommandResult> {
    return this.mpdClient.stopStream();
  }

  public async getVolume(): Promise<CommandResult<number>> {
    const status = await this.mpdClient.getMpdStatus();
    return { result: status?.volume ?? 0 };
  }

  public async setVolume(volume: number): Promise<CommandResult> {
    return this.mpdClient.setVolume(volume);
  }

  public async getState(): Promise<CommandResult<PlayerStateDTO>> {
    const status = await this.mpdClient.getMpdStatus();
    return { result: { state: status?.state ?? 'stop' } };
  }

  public async forceStop(): Promise<void> {
    await this.stopStream();
  }
}
