import { Module } from '@nestjs/common';
import { GoLibrespotApiClient } from './go-librespot-api-client';
import { GoLibrespotSocketWatcher } from './go-librespot-socket-watcher';

@Module({
  providers: [GoLibrespotApiClient, GoLibrespotSocketWatcher],
  exports: [GoLibrespotSocketWatcher, GoLibrespotApiClient],
})
export class GoLibrespotModule {}
