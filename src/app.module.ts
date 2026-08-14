import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PlayerModule } from './player/player.module';
import { ConfigModule } from '@nestjs/config';
import { MpdModule } from './mpd/mpd.module';
import { StationsModule } from './stations/stations.module';
import { DatabaseModule } from './database/database.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { SseModule } from './sse/sse.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
    }),
    DatabaseModule,
    PlayerModule,
    MpdModule,
    StationsModule,
    SseModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
