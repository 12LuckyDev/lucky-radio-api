import { Module } from '@nestjs/common';
import { MpdService } from './mpd.service';

@Module({
  providers: [MpdService],
  exports: [MpdService],
})
export class MpdModule {}
