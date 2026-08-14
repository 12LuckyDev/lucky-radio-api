import { Module } from '@nestjs/common';
import { PlayerController } from './player.controller';
import { PlayerService } from './player.service';
import { MpdModule } from 'src/mpd/mpd.module';
import { AppEventsModule } from 'src/app-events/app-events.module';

@Module({
  imports: [MpdModule, AppEventsModule],
  controllers: [PlayerController],
  providers: [PlayerService],
})
export class PlayerModule {}
