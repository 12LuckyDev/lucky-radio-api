import { Module } from '@nestjs/common';
import { GoLibrespotApiClient } from './go-librespot-api-client';
import { GoLibrespotSocketWatcher } from './go-librespot-socket-watcher';
import { GoLibrespotClient } from './go-librespot.client';
import { GoLibrespotService } from './go-librespot.service';
import { AppEventsModule } from 'src/app-events/app-events.module';

@Module({
  imports: [AppEventsModule],
  providers: [
    GoLibrespotApiClient,
    GoLibrespotSocketWatcher,
    GoLibrespotClient,
    GoLibrespotService,
  ],
})
export class GoLibrespotModule {}
