import { Logger } from '@nestjs/common';
import { PlayerClient } from './player-client';
import { PlayerStatusWithTypeDTO } from '../dto/player-status.dto';
import { AppEventsService } from 'src/app-events/app-events.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { distinctUntilChanged, filter, map } from 'rxjs';
import { CommandResult } from '../../command-result';

const noClientProvided = '[PlayerClientConsumer] No Player client provided';

export abstract class PlayerClientConsumer {
  private readonly playerType: string;
  protected readonly logger: Logger;

  private client: PlayerClient | null = null;

  constructor(playerType: string, name: string) {
    this.playerType = playerType;
    this.logger = new Logger(name);
  }

  protected setClient(
    client: PlayerClient,
    eventEmitter: EventEmitter2,
    appEventsService: AppEventsService,
  ): void {
    this.client = client;

    const observable$ = this.client.statusUpdate$;

    observable$.subscribe((status) => {
      appEventsService.emit({
        type: 'player.status-update',
        data: { ...status, type: this.playerType },
      });
    });

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

  public async setVolume(volume: number): Promise<CommandResult> {
    if (this.client === null) {
      this.logger.fatal(noClientProvided);
      throw new Error(noClientProvided);
    }
    return this.client.setVolume(volume);
  }
}
