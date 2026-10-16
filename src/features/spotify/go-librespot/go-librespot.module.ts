import { Module } from '@nestjs/common';
import { GoLibrespotApiClient } from './go-librespot-api-client';
import { GoLibrespotSocketWatcher } from './go-librespot-socket-watcher';
import { GoLibrespotClient } from './go-librespot.client';

@Module({
  providers: [
    GoLibrespotApiClient,
    GoLibrespotSocketWatcher,
    GoLibrespotClient,
  ],
  exports: [GoLibrespotClient],
})
export class GoLibrespotModule {}
