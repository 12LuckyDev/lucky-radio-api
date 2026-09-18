import { Module } from '@nestjs/common';
import { PlayerController } from './player.controller';
import { PlayerService } from './player.service';
import { MpdModule } from 'src/features/internet-radio/mpd/mpd.module';

@Module({
  imports: [MpdModule],
  controllers: [PlayerController],
  providers: [PlayerService],
})
export class PlayerModule {}
