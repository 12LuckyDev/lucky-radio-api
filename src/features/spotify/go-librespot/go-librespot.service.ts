import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { PlayerClientConsumer } from 'src/features/shared';
import { AppEventsService } from 'src/app-events/app-events.service';
import { GoLibrespotClient } from './go-librespot.client';
import { GoLibrespotApiClient } from './go-librespot-api-client';
import { PlayersRegistry } from 'src/features/global/players-registry';

@Injectable()
export class GoLibrespotService extends PlayerClientConsumer {
  constructor(
    private readonly goLibrespotApiClient: GoLibrespotApiClient,
    private readonly goLibrespotClient: GoLibrespotClient,
    private readonly eventEmitter: EventEmitter2,
    private readonly appEventsService: AppEventsService,
    private readonly playersRegistry: PlayersRegistry,
  ) {
    super('GO_LIBRESPOT', GoLibrespotService.name);

    this.setClient(
      this.goLibrespotClient,
      this.eventEmitter,
      this.appEventsService,
      this.playersRegistry,
    );
  }

  @OnEvent('global-player.playing')
  private async handlePlayerEvent(type: string): Promise<void> {
    await this.processPlayerEvent(type, async () => {
      await this.goLibrespotApiClient.pause();
    });
  }
}
