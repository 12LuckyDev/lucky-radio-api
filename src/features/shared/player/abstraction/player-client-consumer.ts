import { Logger } from '@nestjs/common';
import { PlayerClient } from './player-client';
import { PlayerStatusWithTypeDTO } from '../dto/player-status.dto';
import { AppEventsService } from 'src/app-events/app-events.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { distinctUntilChanged, filter, map } from 'rxjs';
import { PlayersRegistry } from 'src/features/global/players-registry';

const noClientProvided = '[PlayerClientConsumer] No Player client provided';

export abstract class PlayerClientConsumer {
  private readonly playerType: string;
  protected readonly logger: Logger;

  private client: PlayerClient | null = null;

  constructor(playerType: string, name: string) {
    this.playerType = playerType;
    this.logger = new Logger(name);
  }

  public get clientInstance(): PlayerClient | null {
    return this.client;
  }

  protected setClient(
    client: PlayerClient,
    eventEmitter: EventEmitter2,
    appEventsService: AppEventsService,
    playersRegistry: PlayersRegistry,
  ): void {
    this.client = client;
    playersRegistry.register(this.playerType, client);

    const observable$ = this.client.statusUpdate$;

    observable$.subscribe((status) => {
      appEventsService.emit({
        type: 'player.status-update',
        data: { ...status, type: this.playerType },
      });
    });

    // TODO MOVE to FeatureResponseTracker
    observable$
      .pipe(
        map(({ status }) => status?.state === 'play'),
        distinctUntilChanged(),
        filter((playing) => playing),
      )
      .subscribe(() =>
        eventEmitter.emit(`global-player.playing`, this.playerType),
      );
  }

  protected async processPlayerEvent(
    type: string,
    onNeedToStop: () => Promise<void>,
  ): Promise<void> {
    if (this.client === null || type === this.playerType) {
      return;
    }

    const { status } = await this.client.getStatus();
    if (status?.state !== 'play') {
      return;
    }

    this.logger.log(
      `Player ${this.playerType} paused because "${type}" player start playing`,
    );
    await onNeedToStop();
  }

  public async getStatus(): Promise<PlayerStatusWithTypeDTO> {
    if (this.client === null) {
      this.logger.fatal(noClientProvided);
      throw new Error(noClientProvided);
    }
    const status = await this.client.getStatus();
    return { ...status, type: this.playerType };
  }
}
