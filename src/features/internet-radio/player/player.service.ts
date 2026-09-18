import { Injectable, InternalServerErrorException } from '@nestjs/common';
import type { PlayerStatusWithTypeDTO } from '../../shared/player';
import { MpdService } from '../mpd/mpd.service';

@Injectable()
export class PlayerService {
  constructor(private readonly mpdService: MpdService) {}

  public async getStatus(): Promise<PlayerStatusWithTypeDTO> {
    return this.mpdService.getStatus();
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
