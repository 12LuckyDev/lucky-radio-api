import { Module } from '@nestjs/common';
import { MpdClient } from './mpd.client';

@Module({
  providers: [MpdClient],
  exports: [MpdClient],
})
export class MpdModule {}
