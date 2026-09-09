import { DynamicModule, Module } from '@nestjs/common';

import { InternetRadioModule } from './internet-radio/internet-radio.module';
import { FeaturesOptions } from './features-options';

@Module({})
export class FeaturesModule {
  static forRoot({ addIRadioPrefix }: FeaturesOptions): DynamicModule {
    return {
      module: FeaturesModule,
      imports: [InternetRadioModule.register(addIRadioPrefix)],
    };
  }
}
