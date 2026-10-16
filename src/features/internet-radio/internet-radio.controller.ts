import {
  Controller,
  Get,
  Query,
  BadRequestException,
  Post,
} from '@nestjs/common';
import {
  CommandResultMapper,
  PlayerStateDTO,
  playerStateDTOSchema,
} from '../shared';
import { InternetRadioService } from './internet-radio.service';
import {
  ApiBadRequestResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';

@Controller()
export class InternetRadioController {
  constructor(private readonly internetRadioService: InternetRadioService) {}

  @Get('state')
  @ApiOperation({
    summary: 'Get internet radio state',
  })
  @ApiResponse({
    status: 200,
    description: 'Current internet radio state',
    schema: playerStateDTOSchema,
  })
  async getState(): Promise<PlayerStateDTO> {
    const result = await this.internetRadioService.getState();
    return CommandResultMapper.map(result);
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
  @ApiResponse({
    status: 403,
    description: 'No client connected',
  })
  @ApiBadRequestResponse({
    description: 'Missing url parameter',
  })
  async play(@Query('url') url?: string): Promise<void> {
    if (!url) throw new BadRequestException('Missing url parameter');
    const result = await this.internetRadioService.playStream(url);
    CommandResultMapper.map(result);
  }

  @Get('stop')
  @ApiOperation({
    summary: 'Stop internet radio',
  })
  @ApiResponse({
    status: 200,
    description: 'Internet radio stopped',
  })
  @ApiResponse({
    status: 403,
    description: 'No client connected',
  })
  async getStop(): Promise<void> {
    return this.stop();
  }

  @Post('stop')
  @ApiOperation({
    summary: 'Stop internet radio',
  })
  @ApiResponse({
    status: 200,
    description: 'Internet radio stopped',
  })
  @ApiResponse({
    status: 403,
    description: 'No client connected',
  })
  async postStop(): Promise<void> {
    return this.stop();
  }

  private async stop(): Promise<void> {
    const result = await this.internetRadioService.stopStream();
    CommandResultMapper.map(result);
  }
}
