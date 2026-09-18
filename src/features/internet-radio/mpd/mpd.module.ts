import { Module } from '@nestjs/common';
import { MpdClient } from './mpd.client';
import { MpdService } from './mpd.service';
import { AppEventsModule } from 'src/app-events/app-events.module';

@Module({
  imports: [AppEventsModule],
  providers: [MpdClient, MpdService],
  exports: [MpdService],
})
export class MpdModule {}
