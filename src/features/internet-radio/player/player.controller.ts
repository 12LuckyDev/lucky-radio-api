import {
  Controller,
  Get,
  Query,
  BadRequestException,
  Param,
  Post,
  Put,
  ParseIntPipe,
} from '@nestjs/common';
import {
  playerStatusDTOSchema,
  type PlayerStatusDTO,
} from './dto/player-status.dto';
import { PlayerService } from './player.service';
import {
  ApiBadRequestResponse,
  ApiOperation,
  ApiParam,
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
    schema: playerStatusDTOSchema,
  })
  async getStatus(): Promise<PlayerStatusDTO> {
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

  @Get('volume/:volume')
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
  async getVolume(
    @Param('volume', new ParseIntPipe()) volume: number,
  ): Promise<void> {
    await this.volume(volume);
  }

  @Put('volume/:volume')
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
  async putVolume(
    @Param('volume', new ParseIntPipe()) volume: number,
  ): Promise<void> {
    await this.volume(volume);
  }

  private async stop(): Promise<void> {
    await this.playerService.stopStream();
  }

  private async volume(volume: number): Promise<void> {
    await this.playerService.setVolume(volume);
  }
}
