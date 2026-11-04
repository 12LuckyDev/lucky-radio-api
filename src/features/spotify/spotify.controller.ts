import { Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import {
  CommandResultMapper,
  PlayerStateDTO,
  playerStateDTOSchema,
} from '../shared';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SpotifyService } from './spotify.service';
import {
  CurrentSongInfoDTO,
  currentSongInfoDTOSchema,
} from './dto/current-song-info.dto';
import { DeviceInfoDTO, deviceInfoDTOSchema } from './dto/device-info.dto';

@Controller()
export class SpotifyController {
  constructor(private readonly spotifyService: SpotifyService) {}

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
    const result = await this.spotifyService.getState();
    return CommandResultMapper.map(result);
  }

  @Get('current')
  @ApiOperation({
    summary: 'Get current song information',
  })
  @ApiResponse({
    status: 200,
    description: 'Current song',
    schema: currentSongInfoDTOSchema,
  })
  async getCurrentSong(): Promise<CurrentSongInfoDTO> {
    const result = await this.spotifyService.getCurrent();
    return CommandResultMapper.map(result);
  }

  @Get('device')
  @ApiOperation({
    summary: 'Get current device information',
  })
  @ApiResponse({
    status: 200,
    description: 'Current device',
    schema: deviceInfoDTOSchema,
  })
  async getDeviceInfo(): Promise<DeviceInfoDTO> {
    const result = await this.spotifyService.getDeviceInfo();
    return CommandResultMapper.map(result);
  }

  @Post('pause')
  @ApiOperation({
    summary: 'Pause current spotify song',
  })
  @ApiResponse({
    status: 200,
    description: 'Spotify paused',
  })
  async postPause(): Promise<void> {
    const result = await this.spotifyService.pause();
    CommandResultMapper.map(result);
  }

  @Post('resume')
  @ApiOperation({
    summary: 'Resume current spotify song',
  })
  @ApiResponse({
    status: 200,
    description: 'Spotify resumed',
  })
  async postResume(): Promise<void> {
    const result = await this.spotifyService.resume();
    CommandResultMapper.map(result);
  }

  @Post('next')
  @ApiOperation({
    summary: 'Play next spotify song',
  })
  @ApiResponse({
    status: 200,
    description: 'Next song played',
  })
  async postNext(): Promise<void> {
    const result = await this.spotifyService.next();
    CommandResultMapper.map(result);
  }

  @Post('prev')
  @ApiOperation({
    summary: 'Play prev spotify song',
  })
  @ApiResponse({
    status: 200,
    description: 'Prev song played',
  })
  async postPrev(): Promise<void> {
    const result = await this.spotifyService.prev();
    CommandResultMapper.map(result);
  }

  @Post('seek/:position')
  @ApiOperation({
    summary: 'Change position of current song',
  })
  @ApiResponse({
    status: 200,
    description: 'Position changed',
  })
  async postSeek(
    @Param('position', new ParseIntPipe()) position: number,
  ): Promise<void> {
    const result = await this.spotifyService.seek(position);
    CommandResultMapper.map(result);
  }

  @Get('position')
  @ApiOperation({
    summary: 'Get current song position',
  })
  @ApiResponse({
    status: 200,
    description: 'Current song position',
    schema: {
      type: 'object',
      properties: {
        position: {
          type: 'number',
          example: 100,
        },
      },
      required: ['position'],
    },
  })
  async getPosition(): Promise<{ position: number }> {
    const result = await this.spotifyService.getPosition();
    return CommandResultMapper.map(result);
  }
}
