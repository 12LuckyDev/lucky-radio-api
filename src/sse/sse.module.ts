import { Module } from '@nestjs/common';
import { SseController } from './sse.controller';
import { AppEventsModule } from 'src/app-events/app-events.module';

@Module({
  imports: [AppEventsModule],
  controllers: [SseController],
})
export class SseModule {}
