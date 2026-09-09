import { Module } from '@nestjs/common';
import { StationsService } from './stations.service';
import { MpdModule } from 'src/features/internet-radio/mpd/mpd.module';
import { StationsController } from './stations.controller';
import { STATIONS_REPOSITORY } from './repositories/stations.repository.interface';
import { StationsRepository } from './repositories/stations.repository';
import { AppEventsModule } from 'src/app-events/app-events.module';

@Module({
  imports: [MpdModule, AppEventsModule],
  providers: [
    StationsService,
    {
      provide: STATIONS_REPOSITORY,
      useClass: StationsRepository,
    },
  ],
  controllers: [StationsController],
})
export class StationsModule {}
