import { Controller, Get } from '@nestjs/common';
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
}
