import { Injectable, InternalServerErrorException } from '@nestjs/common';
import type { PlayerStatusDTO } from './dto/player-status.dto';
import { MpdService } from '../mpd/mpd.service';
import { combineLatest, map, Observable } from 'rxjs';
import { PlayerStatusUpdateDTO } from './dto/player-status-update.dto';
import { AppEventsService } from 'src/app-events/app-events.service';

@Injectable()
export class PlayerService {
  private readonly playerStatusUpdate$: Observable<PlayerStatusUpdateDTO>;

  constructor(
    private readonly mpdService: MpdService,
    private readonly appEventsService: AppEventsService,
  ) {
    this.playerStatusUpdate$ = combineLatest([
      this.mpdService.connected$,
      this.mpdService.state$,
      this.mpdService.volume$,
    ]).pipe(
      map(([connected, state, volume]) => ({ connected, state, volume })),
    );

    this.playerStatusUpdate$.subscribe((data) =>
      this.appEventsService.emit({ type: 'player.status-update', data }),
    );
  }

  public async getStatus(): Promise<PlayerStatusDTO> {
    return {
      connected: this.mpdService.connected,
      lastConnectingAttempt: this.mpdService.lastConnectingAttempt,
      status: await this.mpdService.getStatus(),
    };
  }

  public async playStream(url: string): Promise<void> {
    const result = await this.mpdService.playStream(url);
    if (result !== true) throw new InternalServerErrorException(result.error);
  }

  public async stopStream(): Promise<void> {
    const result = await this.mpdService.stopStream();
    if (result !== true) throw new InternalServerErrorException(result.error);
  }

  public async setVolume(volume: number): Promise<void> {
    const result = await this.mpdService.setVolume(volume);
    if (result !== true) throw new InternalServerErrorException(result.error);
  }
}
