import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class VolumeService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  @OnEvent('global-volume.volume-changed')
  private handleVolumeChangeEvent(volume: number): void {
    console.log('global-volume.volume-changed', volume);
  }

  public setVolume(volume: number): void {
    this.eventEmitter.emit('global-volume.change-command', volume);
  }
}
