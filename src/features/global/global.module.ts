import { Global, Module } from '@nestjs/common';
import { FeatureResponseTracker } from './feature-response-tracker';
import { PlayersRegistry } from './players-registry';
import { PlayersStatusService } from './players-status.service';
import { GlobalController } from './global.controller';

@Global()
@Module({
  providers: [PlayersRegistry, FeatureResponseTracker, PlayersStatusService],
  exports: [PlayersRegistry, FeatureResponseTracker, PlayersStatusService],
  controllers: [GlobalController],
})
export class GlobalModule {}
