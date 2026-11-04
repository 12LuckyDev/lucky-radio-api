import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PlayersStatusService } from './players-status.service';

@Controller()
export class GlobalController {
  constructor(private readonly playersStatusService: PlayersStatusService) {}

  @Get('current-player')
  @ApiOperation({
    summary: 'Set current player',
  })
  @ApiResponse({
    status: 200,
    description: 'Get current player',
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
  getVolume(): { current: string | null } {
    const { playingPlayer } = this.playersStatusService.status;
    return { current: playingPlayer };
  }
}
