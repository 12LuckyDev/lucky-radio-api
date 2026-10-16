import { Injectable } from '@nestjs/common';
import { PlayerService, PlayerState } from '../shared';
import { PlayersRegistry } from '../global/players-registry';
import { GoLibrespotClient } from './go-librespot/go-librespot.client';
import { map, Observable } from 'rxjs';
import { GoLibrespotStatusMapper } from './go-librespot/mappers/go-librespot-status-mapper';

@Injectable()
export class SpotifyService extends PlayerService {
  constructor(
    private readonly goLibrespotClient: GoLibrespotClient,
    private readonly playersRegistry: PlayersRegistry,
  ) {
    super('spotify');
    this.playersRegistry.register(this.name, this.goLibrespotClient, this);
  }

  public get volume$(): Observable<number> {
    return this.goLibrespotClient.status$.pipe(
      map((s) => GoLibrespotStatusMapper.toVolume(s)),
    );
  }

  public get state$(): Observable<PlayerState> {
    return this.goLibrespotClient.status$.pipe(
      map((s) => GoLibrespotStatusMapper.toPlayerState(s)),
    );
  }
}
