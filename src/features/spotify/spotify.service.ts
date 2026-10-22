import { Injectable } from '@nestjs/common';
import {
  CommandResult,
  PlayerService,
  PlayerState,
  PlayerStateDTO,
} from '../shared';
import { PlayersRegistry } from '../global/players-registry';
import { Observable } from 'rxjs';
import { GoLibrespotApiClient } from './go-librespot/go-librespot-api-client';
import { GoLibrespotSocketWatcher } from './go-librespot/go-librespot-socket-watcher';
import { GoLibrespotStatusMapper } from './utils';
import { CurrentSongInfoDTO } from './dto/current-song-info.dto';
import { SpotifyStateHandler } from './spotify-state-handler';
import { DeviceInfoDTO } from './dto/device-info.dto';
import { LibrespotStatus } from './go-librespot/models';

@Injectable()
export class SpotifyService extends PlayerService {
  constructor(
    private readonly goLibrespotWatcher: GoLibrespotSocketWatcher,
    private readonly goLibrespotApiClient: GoLibrespotApiClient,
    private readonly playersRegistry: PlayersRegistry,
    private readonly spotifyStateHandler: SpotifyStateHandler,
  ) {
    super('spotify');
    this.playersRegistry.register(this.name, this);
  }

  public get connected$(): Observable<boolean> {
    return this.goLibrespotWatcher.connected$;
  }

  public get volume$(): Observable<number> {
    return this.spotifyStateHandler.volume$;
  }

  public get state$(): Observable<PlayerState> {
    return this.spotifyStateHandler.state$;
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
    return this.extractFromStatus(
      (status) => ({ state: GoLibrespotStatusMapper.toPlayerState(status) }),
      'getState',
    );
  }

  public async getVolume(): Promise<CommandResult<number>> {
    return this.extractFromStatus(
      (status) => GoLibrespotStatusMapper.toVolume(status),
      'getVolume',
    );
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
    return this.extractFromStatus(
      (status) => GoLibrespotStatusMapper.toCurrentSong(status),
      'getCurrent',
    );
  }

  public async getDeviceInfo(): Promise<CommandResult<DeviceInfoDTO>> {
    return this.extractFromStatus(
      (status) => GoLibrespotStatusMapper.toDeviceInfo(status),
      'getDeviceInfo',
    );
  }

  public async forceStop(): Promise<void> {
    await this.pause();
  }

  private async extractFromStatus<T>(
    map: (status: LibrespotStatus | null) => T,
    methodName: string,
  ): Promise<CommandResult<T>> {
    try {
      const status = await this.goLibrespotApiClient.getStatus();

      return {
        result: map(status),
      };
    } catch (ex: unknown) {
      const msg = 'Error during obtaining state';
      this.logger.error(`[${methodName}] ${msg}`, ex);
      return { error: msg };
    }
  }
}
