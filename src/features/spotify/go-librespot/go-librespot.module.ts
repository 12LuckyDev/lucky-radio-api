import { Module } from '@nestjs/common';
import { GoLibrespotApiClient } from './go-librespot-api-client';
import { GoLibrespotSocketWatcher } from './go-librespot-socket-watcher';
import { GoLibrespotClient } from './go-librespot.client';
import { GoLibrespotService } from './go-librespot.service';

@Module({
  providers: [
    GoLibrespotApiClient,
    GoLibrespotSocketWatcher,
    GoLibrespotClient,
    GoLibrespotService,
  ],
})
export class GoLibrespotModule {}
