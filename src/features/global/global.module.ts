import { Global, Module } from '@nestjs/common';
import { FeatureResponseTracker } from './feature-response-tracker';
import { PlayersRegistry } from './players-registry';

@Global()
@Module({
  providers: [PlayersRegistry, FeatureResponseTracker],
  exports: [PlayersRegistry, FeatureResponseTracker],
})
export class GlobalModule {}
