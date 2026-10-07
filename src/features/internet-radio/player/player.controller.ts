import {
  Controller,
  Get,
  Query,
  BadRequestException,
  Post,
} from '@nestjs/common';
import {
  playerStatusWithTypeDTOSchema,
  PlayerStatusWithTypeDTO,
} from '../../shared';
import { PlayerService } from './player.service';
import {
  ApiBadRequestResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';

@Controller('player')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @Get('status')
  @ApiOperation({
    summary: 'Get player status',
  })
  @ApiResponse({
    status: 200,
    description: 'Current player status',
    schema: playerStatusWithTypeDTOSchema,
  })
  async getStatus(): Promise<PlayerStatusWithTypeDTO> {
    return this.playerService.getStatus();
  }

  @Get('play')
  @ApiOperation({
    summary: 'Play stream',
  })
  @ApiQuery({
    name: 'url',
    type: String,
    description: 'Stream URL',
    example: 'https://example.com/stream.mp3',
  })
  @ApiResponse({
    status: 200,
    description: 'Stream playback started',
  })
  @ApiBadRequestResponse({
    description: 'Missing url parameter',
  })
  async play(@Query('url') url?: string): Promise<void> {
    if (!url) throw new BadRequestException('Missing url parameter');
    await this.playerService.playStream(url);
  }

  @Get('stop')
  @ApiOperation({
    summary: 'Stop player',
  })
  @ApiResponse({
    status: 200,
    description: 'Player stopped',
  })
  async getStop(): Promise<void> {
    return this.stop();
  }

  @Post('stop')
  @ApiOperation({
    summary: 'Stop player',
  })
  @ApiResponse({
    status: 200,
    description: 'Player stopped',
  })
  async postStop(): Promise<void> {
    return this.stop();
  }

  private async stop(): Promise<void> {
    await this.playerService.stopStream();
  }
}
