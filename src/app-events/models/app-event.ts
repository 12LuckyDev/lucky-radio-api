import {
  PlayerStateWithTypeDTO,
  playerStateWithTypeDTOSchema,
} from 'src/features/shared';
import {
  CurrentStationInfoDTO,
  currentStationInfoDTOSchema,
} from 'src/features/internet-radio/stations/dto/current-station.dto';
import {
  CurrentSongInfoDTO,
  currentSongInfoDTOSchema,
} from 'src/features/spotify/dto/current-song-info.dto';

export type AppEvent =
  | {
      type: 'stations.current-update';
      data: CurrentStationInfoDTO;
    }
  | {
      type: 'stations.stations-update';
      data: 'stations-update';
    }
  | {
      type: 'player.state-update';
      data: PlayerStateWithTypeDTO;
    }
  | {
      type: 'global-volume-change';
      data: number | { error: string };
    }
  | {
      type: 'spotify.current-update';
      data: CurrentSongInfoDTO;
    };

export const appEventSchema = {
  oneOf: [
    {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['stations.current-update'],
          example: 'stations.current-update',
        },
        data: currentStationInfoDTOSchema,
      },
      required: ['type', 'data'],
    },
    {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['stations.stations-update'],
          example: 'stations.stations-update',
        },
        data: {
          type: 'string',
          enum: ['stations-update'],
          example: 'stations-update',
        },
      },
      required: ['type', 'data'],
    },
    {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['player.state-update'],
          example: 'player.state-update',
        },
        data: playerStateWithTypeDTOSchema,
      },
      required: ['type', 'data'],
    },
    {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['global-volume-change'],
          example: 'global-volume-change',
        },
        data: {
          type: 'number',
          example: 100,
        },
      },
      required: ['type', 'data'],
    },
    {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['spotify.current-update'],
          example: 'spotify.current-update',
        },
        data: currentSongInfoDTOSchema,
      },
      required: ['type', 'data'],
    },
  ],
};
