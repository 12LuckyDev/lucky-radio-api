import { DynamicModule, Module } from '@nestjs/common';

import { InternetRadioModule } from './internet-radio/internet-radio.module';
import { FeaturesOptions } from './features-options';
import { SpotifyModule } from './spotify/spotify.module';
import { VolumeModule } from './volume/volume.module';

@Module({})
export class FeaturesModule {
  static forRoot({
    addIRadioPrefix,
    addSpotifyModule,
  }: FeaturesOptions): DynamicModule {
    return {
      module: FeaturesModule,
      imports: [
        VolumeModule,
        InternetRadioModule.register(addIRadioPrefix),
        ...(addSpotifyModule ? [SpotifyModule.register()] : []),
      ],
    };
  }
}
