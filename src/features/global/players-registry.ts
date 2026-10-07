import { Injectable, Logger } from '@nestjs/common';
import { PlayerClient } from '../shared';
import { CacheService } from 'src/cache/cache.service';
import { filter, pairwise, switchMap } from 'rxjs';
import { FeatureResponseTracker } from './feature-response-tracker';
import { AppEventsService } from 'src/app-events/app-events.service';

const VOLUME_TRACKER_KEY = 'VOLUME';

const CACHED_VOLUME = 'CACHED_VOLUME';
const DEFAULT_VOLUME = 100;

@Injectable()
export class PlayersRegistry {
  private readonly logger = new Logger(PlayersRegistry.name);

  private readonly players = new Map<string, PlayerClient>();

  private lastTargetVolume: number = DEFAULT_VOLUME;

  constructor(
    private readonly cacheService: CacheService,
    private readonly tracker: FeatureResponseTracker,
    private readonly appEventsService: AppEventsService,
  ) {}

  private get activePlayers(): string[] {
    return Array.from(this.players.entries())
      .filter((row) => row[1].connected)
      .map(([key]) => key);
  }

  public register(name: string, client: PlayerClient): void {
    this.logger.log(`${name} registered`);
    this.players.set(name, client);

    this.initConnectionSubscribers(name, client);
    this.initVolumeSubscribers(name, client);
  }

  public async setGlobalVolume(volume: number): Promise<void> {
    this.lastTargetVolume = volume;
    this.tracker.reset(VOLUME_TRACKER_KEY);
    const request = this.tracker.wait(VOLUME_TRACKER_KEY, this.activePlayers);

    this.players.forEach((client) => {
      void client.setVolume(volume);
    });

    const result = await request;
    if (result.success) {
      await this.cacheService.set(CACHED_VOLUME, volume);
      this.appEventsService.emit({
        type: 'global-volume-change',
        data: volume,
      });
    } else if (result.timedOut) {
      this.appEventsService.emit({
        type: 'global-volume-change',
        data: { error: 'VOLUME_CHANGE_TIMEOUT' },
      });
    }
  }

  public async getGlobalVolume(): Promise<number> {
    return this.getCachedVolume();
  }

  private initVolumeSubscribers(name: string, client: PlayerClient): void {
    client.volume$.subscribe((volume) => {
      if (this.lastTargetVolume === volume) {
        this.tracker.response(VOLUME_TRACKER_KEY, name);
      }
    });
  }

  private initConnectionSubscribers(name: string, client: PlayerClient): void {
    client.connected$.subscribe((connected) => {
      this.logger.log(`Client ${name} ${connected ? 'connect' : 'disconect'}`);
    });

    client.connected$
      .pipe(
        pairwise(),
        filter(([prev, curr]) => !prev && curr),
        switchMap(() => this.initVolume(client)),
      )
      .subscribe();
  }

  private async getCachedVolume(): Promise<number> {
    return (
      (await this.cacheService.get<number>(CACHED_VOLUME)) ?? DEFAULT_VOLUME
    );
  }

  private async initVolume(client: PlayerClient): Promise<void> {
    const targetVolume = await this.getCachedVolume();

    const clientVolume = await client.getVolume();
    if (clientVolume !== targetVolume) {
      this.logger.log(
        `[InitialVolumeChange] change initial player volume from ${clientVolume} to ${targetVolume}`,
      );
      await client.setVolume(targetVolume);
    }
  }
}
