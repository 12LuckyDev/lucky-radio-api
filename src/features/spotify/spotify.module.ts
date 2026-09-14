import { DynamicModule, Module } from '@nestjs/common';
import { RouterModule, Routes } from '@nestjs/core';
import { PlayerModule } from './player/player.module';
import { GoLibrespotModule } from './go-librespot/go-librespot.module';

const PREFIX = 'spotify';

@Module({})
export class SpotifyModule {
  static register(): DynamicModule {
    const routes: Routes = [{ path: PREFIX, module: PlayerModule }];

    return {
      module: SpotifyModule,
      imports: [GoLibrespotModule, PlayerModule, RouterModule.register(routes)],
    };
  }
}
