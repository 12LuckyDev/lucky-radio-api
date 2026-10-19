import { Injectable } from '@nestjs/common';
import {
  CommandResult,
  PlayerService,
  PlayerState,
  PlayerStateDTO,
} from '../shared';
import { PlayersRegistry } from '../global/players-registry';
import { distinctUntilChanged, map, Observable } from 'rxjs';
import { GoLibrespotApiClient } from './go-librespot/go-librespot-api-client';
import { GoLibrespotSocketWatcher } from './go-librespot/go-librespot-socket-watcher';
import { compareCurrentSong, GoLibrespotStatusMapper } from './utils';
import { AppEventsService } from 'src/app-events/app-events.service';
import { CurrentSongInfoDTO } from './dto/current-song-info.dto';

@Injectable()
export class SpotifyService extends PlayerService {
  constructor(
    private readonly goLibrespotWatcher: GoLibrespotSocketWatcher,
    private readonly goLibrespotApiClient: GoLibrespotApiClient,
    private readonly playersRegistry: PlayersRegistry,
    private readonly appEventsService: AppEventsService,
  ) {
    super('spotify');
    this.playersRegistry.register(this.name, this);
    this.goLibrespotWatcher.status$
      .pipe(
        map((status) => GoLibrespotStatusMapper.toCurrentSong(status)),
        distinctUntilChanged(compareCurrentSong),
      )
      .subscribe((data) =>
        this.appEventsService.emit({ type: 'spotify.current-update', data }),
      );
  }

  public get connected$(): Observable<boolean> {
    return this.goLibrespotWatcher.connected$;
  }

  public get volume$(): Observable<number> {
    return this.goLibrespotWatcher.status$.pipe(
      map((s) => GoLibrespotStatusMapper.toVolume(s)),
    );
  }

  public get state$(): Observable<PlayerState> {
    return this.goLibrespotWatcher.status$.pipe(
      map((s) => GoLibrespotStatusMapper.toPlayerState(s)),
    );
  }

  public async pause(): Promise<CommandResult> {
    try {
      await this.goLibrespotApiClient.pause();
      return true;
    } catch (ex) {
      const msg = 'Error during pause player';
      this.logger.error(`[setVolume] ${msg}`, ex);
      return { error: msg };
    }
  }

  public async getState(): Promise<CommandResult<PlayerStateDTO>> {
    try {
      const status = await this.goLibrespotApiClient.getStatus();

      return {
        result: { state: GoLibrespotStatusMapper.toPlayerState(status) },
      };
    } catch (ex: unknown) {
      const msg = 'Error during obtaining state';
      this.logger.error(`[getVolume] ${msg}`, ex);
      return { error: msg };
    }
  }

  public async getVolume(): Promise<CommandResult<number>> {
    try {
      const volumeInfo = await this.goLibrespotApiClient.getVolume();
      return { result: volumeInfo.value };
    } catch (ex) {
      const msg = 'Error during obtaining volum';
      this.logger.error(`[getVolume] ${msg}`, ex);
      return { error: msg };
    }
  }

  public async setVolume(volume: number): Promise<CommandResult> {
    try {
      await this.goLibrespotApiClient.setVolume({ volume });
      return true;
    } catch (ex) {
      const msg = 'Error during setting volum';
      this.logger.error(`[setVolume] ${msg}`, ex);
      return { error: msg };
    }
  }

  public async getCurrent(): Promise<CommandResult<CurrentSongInfoDTO>> {
    try {
      const status = await this.goLibrespotApiClient.getStatus();

      return {
        result: GoLibrespotStatusMapper.toCurrentSong(status),
      };
    } catch (ex: unknown) {
      const msg = 'Error during obtaining state';
      this.logger.error(`[getVolume] ${msg}`, ex);
      return { error: msg };
    }
  }

  public async forceStop(): Promise<void> {
    await this.pause();
  }
}
