import { DynamicModule, Module } from '@nestjs/common';
import { RouterModule, Routes } from '@nestjs/core';
import { GoLibrespotModule } from './go-librespot/go-librespot.module';
import { SpotifyService } from './spotify.service';

const PREFIX = 'spotify';

@Module({})
export class SpotifyModule {
  static register(): DynamicModule {
    const routes: Routes = [{ path: PREFIX, module: SpotifyModule }];

    return {
      module: SpotifyModule,
      imports: [GoLibrespotModule, RouterModule.register(routes)],
      providers: [SpotifyService],
    };
  }
}
