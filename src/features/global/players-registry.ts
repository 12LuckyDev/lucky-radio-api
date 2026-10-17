import { Injectable, Logger } from '@nestjs/common';
import { CommandResultMapper, PlayerService } from '../shared';
import { CacheService } from 'src/cache/cache.service';
import { distinctUntilChanged, filter, pairwise, switchMap } from 'rxjs';
import { FeatureResponseTracker } from './feature-response-tracker';
import { AppEventsService } from 'src/app-events/app-events.service';
import { PlayersStatusService } from './players-status.service';

const VOLUME_TRACKER_KEY = 'VOLUME';

const CACHED_VOLUME = 'CACHED_VOLUME';
const DEFAULT_VOLUME = 100;

@Injectable()
export class PlayersRegistry {
  private readonly logger = new Logger(PlayersRegistry.name);

  private readonly players = new Map<string, PlayerService>();

  private lastTargetVolume: number = DEFAULT_VOLUME;

  constructor(
    private readonly cacheService: CacheService,
    private readonly tracker: FeatureResponseTracker,
    private readonly appEventsService: AppEventsService,
    private readonly statusService: PlayersStatusService,
  ) {}

  public register(name: string, player: PlayerService): void {
    this.logger.log(`${name} registered`);
    this.players.set(name, player);

    this.initConnectionSubscribers(name, player);
    this.initStateSubscribers(name, player);
    this.initVolumeSubscribers(name, player);
  }

  public async setGlobalVolume(volume: number): Promise<void> {
    this.lastTargetVolume = volume;
    this.tracker.reset(VOLUME_TRACKER_KEY);
    const request = this.tracker.wait(
      VOLUME_TRACKER_KEY,
      this.statusService.status.connectedPlayers,
    );

    this.players.forEach((player) => {
      void player.setVolume(volume);
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

  private async forceStopOtherPlayers(skip: string): Promise<void> {
    for (const [k, v] of this.statusService.status.playerStates) {
      if (k !== skip && v === 'play') {
        const player = this.players.get(k);

        if (player) {
          await player.forceStop();
          this.logger.log(
            `Player ${k} paused because "${skip}" player start playing`,
          );
        }
      }
    }
  }

  private initVolumeSubscribers(name: string, player: PlayerService): void {
    player.volume$.pipe(distinctUntilChanged()).subscribe((volume) => {
      if (this.lastTargetVolume === volume) {
        this.tracker.response(VOLUME_TRACKER_KEY, name);
      }
    });
  }

  private initStateSubscribers(name: string, player: PlayerService): void {
    player.state$.pipe(distinctUntilChanged()).subscribe((state) => {
      this.statusService.updatePlayerState(name, state);
      this.appEventsService.emit({
        type: 'player.state-update',
        data: { state, type: name },
      });
      if (state === 'play') {
        void this.forceStopOtherPlayers(name);
      }
    });
  }

  private initConnectionSubscribers(name: string, player: PlayerService): void {
    player.connected$.subscribe((connected) => {
      this.logger.log(`Player ${name} ${connected ? 'connect' : 'disconect'}`);
      this.statusService.updateConnection(name, connected);
    });

    player.connected$
      .pipe(
        pairwise(),
        filter(([prev, curr]) => !prev && curr),
        switchMap(() => this.initVolume(name, player)),
      )
      .subscribe();
  }

  private async getCachedVolume(): Promise<number> {
    return (
      (await this.cacheService.get<number>(CACHED_VOLUME)) ?? DEFAULT_VOLUME
    );
  }

  private async initVolume(name: string, player: PlayerService): Promise<void> {
    const targetVolume = await this.getCachedVolume();

    const playerVolumeResult = await player.getVolume();
    const playerVolume = CommandResultMapper.getResult(playerVolumeResult, 0);
    if (playerVolume !== targetVolume) {
      this.logger.log(
        `[InitialVolumeChange] change initial player ${name} volume from ${playerVolume} to ${targetVolume}`,
      );
      await player.setVolume(targetVolume);
    }
  }
}
