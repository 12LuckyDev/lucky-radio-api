import { DynamicModule, Module } from '@nestjs/common';
import { PlayerModule } from './player/player.module';
import { MpdModule } from './mpd/mpd.module';
import { StationsModule } from './stations/stations.module';
import { RouterModule, Routes } from '@nestjs/core';

const PREFIX = 'i-radio';

@Module({})
export class InternetRadioModule {
  static register(addPrefix: boolean): DynamicModule {
    const routes: Routes = [];
    if (addPrefix) {
      routes.push({ path: PREFIX, module: PlayerModule });
      routes.push({ path: PREFIX, module: StationsModule });
    }

    return {
      module: InternetRadioModule,
      imports: [
        PlayerModule,
        MpdModule,
        StationsModule,
        RouterModule.register(routes),
      ],
    };
  }
}
