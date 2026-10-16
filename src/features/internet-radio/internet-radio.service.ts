import { Injectable } from '@nestjs/common';
import {
  PlayerService,
  PlayerState,
  type CommandResult,
  type PlayerStateDTO,
} from '../shared';
import { MpdClient } from './mpd/mpd.client';
import { Observable } from 'rxjs';
import { PlayersRegistry } from '../global/players-registry';

@Injectable()
export class InternetRadioService extends PlayerService {
  constructor(
    private readonly mpdClient: MpdClient,
    private readonly playersRegistry: PlayersRegistry,
  ) {
    super('i-radio');
    this.playersRegistry.register(this.name, this.mpdClient, this);
  }

  // MDPclient ma jeden observable na mpdstatus - ten serwis rozdziela je

  public get volume$(): Observable<number> {
    return this.mpdClient.volume$;
  }

  public get state$(): Observable<PlayerState> {
    return this.mpdClient.state$;
  }

  public async playStream(url: string): Promise<CommandResult> {
    return this.mpdClient.playStream(url);
  }

  public async stopStream(): Promise<CommandResult> {
    return this.mpdClient.stopStream();
  }

  public async getState(): Promise<CommandResult<PlayerStateDTO>> {
    const state = await this.mpdClient.getState();
    return { result: { state } };
  }
}
