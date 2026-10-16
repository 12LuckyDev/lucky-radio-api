import { DynamicModule, Module } from '@nestjs/common';
import { MpdModule } from './mpd/mpd.module';
import { StationsModule } from './stations/stations.module';
import { RouterModule, Routes } from '@nestjs/core';
import { InternetRadioController } from './internet-radio.controller';
import { InternetRadioService } from './internet-radio.service';

const PREFIX = 'i-radio';

@Module({})
export class InternetRadioModule {
  static register(addPrefix: boolean): DynamicModule {
    const routes: Routes = [];
    if (addPrefix) {
      routes.push({ path: PREFIX, module: InternetRadioModule });
      routes.push({ path: PREFIX, module: StationsModule });
    }

    return {
      module: InternetRadioModule,
      imports: [MpdModule, StationsModule, RouterModule.register(routes)],
      providers: [InternetRadioService],
      controllers: [InternetRadioController],
    };
  }
}
