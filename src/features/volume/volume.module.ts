import { Module } from '@nestjs/common';
import { VolumeController } from './volume.controller';

@Module({
  controllers: [VolumeController],
})
export class VolumeModule {}
