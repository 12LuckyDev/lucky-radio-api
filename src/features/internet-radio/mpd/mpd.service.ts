import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { MpdClient } from './mpd.client';
import { CommandResult, PlayerClientConsumer } from 'src/features/shared';
import { AppEventsService } from 'src/app-events/app-events.service';

@Injectable()
export class MpdService extends PlayerClientConsumer {
  constructor(
    private readonly mpdClient: MpdClient,
    private readonly eventEmitter: EventEmitter2,
    private readonly appEventsService: AppEventsService,
  ) {
    super('MPD', MpdService.name);

    this.setClient(this.mpdClient, this.eventEmitter, this.appEventsService);
  }

  @OnEvent('global-player.playing')
  private async handlePlayerEvent(type: string): Promise<void> {
    await this.processPlayerEvent(type, async () => {
      await this.mpdClient.stopStream();
    });
  }

  @OnEvent('global-volume.change-command')
  private async handleVolumeChangeCommand(volume: number): Promise<void> {
    await this.setVolume(volume);
  }

  public get url(): string | null {
    return this.mpdClient.url;
  }

  public get url$(): Observable<string | null> {
    return this.mpdClient.url$;
  }

  public async playStream(url: string): Promise<CommandResult> {
    return this.mpdClient.playStream(url);
  }

  public async stopStream(): Promise<CommandResult> {
    return this.mpdClient.stopStream();
  }
}
