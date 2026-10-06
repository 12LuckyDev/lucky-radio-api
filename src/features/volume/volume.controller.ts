import { Controller, Get, Param, ParseIntPipe, Put } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { VolumeService } from './volume.service';

@Controller('volume')
export class VolumeController {
  constructor(private readonly volumeService: VolumeService) {}

  @Get(':volume')
  @ApiOperation({
    summary: 'Set player volume',
  })
  @ApiParam({
    name: 'volume',
    type: Number,
    description: 'Volume level',
    example: 50,
  })
  @ApiResponse({
    status: 200,
    description: 'Volume changed',
  })
  getVolume(@Param('volume', new ParseIntPipe()) volume: number): void {
    this.volumeService.setVolume(volume);
  }

  @Put(':volume')
  @ApiOperation({
    summary: 'Set player volume',
  })
  @ApiParam({
    name: 'volume',
    type: Number,
    description: 'Volume level',
    example: 50,
  })
  @ApiResponse({
    status: 200,
    description: 'Volume changed',
  })
  putVolume(@Param('volume', new ParseIntPipe()) volume: number): void {
    this.volumeService.setVolume(volume);
  }
}
