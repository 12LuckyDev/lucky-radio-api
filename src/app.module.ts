import { DynamicModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { SseModule } from './sse/sse.module';
import { FeaturesModule } from './features/features.module';
import { FeaturesOptions } from './features/features-options';

@Module({})
export class AppModule {
  static register({ features }: { features: FeaturesOptions }): DynamicModule {
    return {
      module: AppModule,
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        EventEmitterModule.forRoot({
          wildcard: true,
          delimiter: '.',
        }),
        DatabaseModule,
        SseModule,
        FeaturesModule.forRoot(features),
      ],
      controllers: [AppController],
    };
  }
}
