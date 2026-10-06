import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { PlayerClientConsumer } from 'src/features/shared';
import { AppEventsService } from 'src/app-events/app-events.service';
import { GoLibrespotClient } from './go-librespot.client';
import { GoLibrespotApiClient } from './go-librespot-api-client';

@Injectable()
export class GoLibrespotService extends PlayerClientConsumer {
  constructor(
    private readonly goLibrespotApiClient: GoLibrespotApiClient,
    private readonly goLibrespotClient: GoLibrespotClient,
    private readonly eventEmitter: EventEmitter2,
    private readonly appEventsService: AppEventsService,
  ) {
    super('GO_LIBRESPOT', GoLibrespotService.name);

    this.setClient(
      this.goLibrespotClient,
      this.eventEmitter,
      this.appEventsService,
    );
  }

  @OnEvent('global-player.playing')
  private async handlePlayerEvent(type: string): Promise<void> {
    await this.processPlayerEvent(type, async () => {
      await this.goLibrespotApiClient.pause();
    });
  }

  @OnEvent('global-volume.change-command')
  private async handleVolumeChangeCommand(volume: number): Promise<void> {
    await this.setVolume(volume);
  }
}
