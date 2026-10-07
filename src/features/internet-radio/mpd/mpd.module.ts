import { Module } from '@nestjs/common';
import { MpdClient } from './mpd.client';
import { MpdService } from './mpd.service';

@Module({
  providers: [MpdClient, MpdService],
  exports: [MpdService],
})
export class MpdModule {}
