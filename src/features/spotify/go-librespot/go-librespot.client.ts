import { Injectable } from '@nestjs/common';
import { CommandResult, PlayerClient, PlayerState } from 'src/features/shared';
import { GoLibrespotApiClient } from './go-librespot-api-client';
import { GoLibrespotSocketWatcher } from './go-librespot-socket-watcher';
import { GoLibrespotStatusMapper } from './mappers/go-librespot-status-mapper';
import { distinctUntilChanged, map, Observable } from 'rxjs';
import { LibrespotStatus } from './models';

const goLibrespotError = 'go-librespot error';

@Injectable()
export class GoLibrespotClient extends PlayerClient {
  constructor(
    private readonly apiClient: GoLibrespotApiClient,
    private readonly watcher: GoLibrespotSocketWatcher,
  ) {
    super(GoLibrespotClient.name);

    this.watcher.connected$.subscribe((connected) =>
      this.changeConnected(connected),
    );

    // TODO REMOVE
    this.watcher.status$
      .pipe(
        map((s) => GoLibrespotStatusMapper.toVolume(s)),
        distinctUntilChanged(),
      )
      .subscribe((volume) => this.changeVolume(volume));

    // TODO REMOVE
    this.watcher.status$
      .pipe(
        map((s) => GoLibrespotStatusMapper.toPlayerState(s)),
        distinctUntilChanged(),
      )
      .subscribe((state) => this.changeState(state));
  }

  public get status$(): Observable<LibrespotStatus | null> {
    return this.watcher.status$;
  }

  public async getState(): Promise<PlayerState> {
    try {
      const status = await this.apiClient.getStatus();

      return GoLibrespotStatusMapper.toPlayerState(status);
    } catch (ex) {
      this.logger.error(`[getStatus] ${goLibrespotError}`, ex);
      throw ex;
    }
  }

  public async setVolume(volume: number): Promise<CommandResult> {
    try {
      await this.apiClient.setVolume({ volume });
      return true;
    } catch (ex) {
      this.logger.error(`[setVolume] ${goLibrespotError}`, ex);
      return { error: goLibrespotError };
    }
  }

  public async getVolume(): Promise<number | null> {
    try {
      const volumeInfo = await this.apiClient.getVolume();
      return volumeInfo.value;
    } catch (ex) {
      this.logger.error(`[getVolume] error during obtaining volume`, ex);
      return null;
    }
  }

  public async forceStop(): Promise<void> {
    await this.apiClient.pause();
  }
}
