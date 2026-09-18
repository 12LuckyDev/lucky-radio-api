import { Injectable } from '@nestjs/common';
import { PlayerClient, PlayerStatusDTO } from 'src/features/shared/player';
import { GoLibrespotApiClient } from './go-librespot-api-client';
import { GoLibrespotSocketWatcher } from './go-librespot-socket-watcher';
import { GoLibrespotStatusMapper } from './mappers/go-librespot-status-mapper';
import { combineLatest, distinctUntilChanged, map, Observable } from 'rxjs';
import { compareGoLibrespotStatus } from './utils/compare-go-librespot-status';

const goLibrespotError = 'go-librespot error';

@Injectable()
export class GoLibrespotClient extends PlayerClient {
  constructor(
    private readonly apiClient: GoLibrespotApiClient,
    private readonly watcher: GoLibrespotSocketWatcher,
  ) {
    super(GoLibrespotClient.name);
    this.watcher.lastConnectingAttempt$.subscribe(
      (date) => (this.lastConnectingAttempt = date),
    );
    this.watcher.connected$.subscribe((connected) =>
      this.changeConnected(connected),
    );
  }

  public get statusUpdate$(): Observable<PlayerStatusDTO> {
    return combineLatest([
      this.connected$,
      this.watcher.status$.pipe(distinctUntilChanged(compareGoLibrespotStatus)),
    ]).pipe(
      map(([connected, status]) => ({
        connected: status !== null && connected,
        lastConnectingAttempt: this.lastConnectingAttempt,
        status: GoLibrespotStatusMapper.toPlayerStatusData(status),
      })),
    );
  }

  public async getStatus(): Promise<PlayerStatusDTO> {
    try {
      const status = await this.apiClient.getStatus();

      return {
        connected: status !== null && this.connected,
        lastConnectingAttempt: this.lastConnectingAttempt,
        status: GoLibrespotStatusMapper.toPlayerStatusData(status),
      };
    } catch (ex) {
      this.logger.error(`[getStatus] ${goLibrespotError}`, ex);
      throw ex;
    }
  }

  public async setVolume(volume: number): Promise<true | { error: string }> {
    try {
      await this.apiClient.setVolume({ volume });
      return true;
    } catch (ex) {
      this.logger.error(`[setVolume] ${goLibrespotError}`, ex);
      return { error: goLibrespotError };
    }
  }
}
