import { Controller, Get, Param, ParseIntPipe, Put } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { PlayersRegistry } from '../global/players-registry';

@Controller('volume')
export class VolumeController {
  constructor(private readonly playersRegistry: PlayersRegistry) {}

  @Get()
  @ApiOperation({
    summary: 'Set player volume',
  })
  @ApiResponse({
    status: 200,
    description: 'Get current global (from all players) volume',
    schema: {
      type: 'object',
      properties: {
        volume: {
          type: 'number',
          example: 100,
        },
      },
      required: ['volume'],
    },
  })
  async getVolume(): Promise<{ volume: number }> {
    const volume = await this.playersRegistry.getGlobalVolume();
    return { volume };
  }

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
  setVolumeByGet(@Param('volume', new ParseIntPipe()) volume: number): void {
    void this.playersRegistry.setGlobalVolume(volume);
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
    void this.playersRegistry.setGlobalVolume(volume);
  }
}
