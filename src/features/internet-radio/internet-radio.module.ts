import { Module } from '@nestjs/common';
import { PlayerModule } from './player/player.module';
import { MpdModule } from './mpd/mpd.module';
import { StationsModule } from './stations/stations.module';

@Module({
  imports: [PlayerModule, MpdModule, StationsModule],
})
export class InternetRadioModule {}
