import { StationDTO, stationDTOSchema } from './station.dto';

type CurrentStationDTO =
  | StationDTO
  | {
      id: null;
    }
  | null;

export type CurrentStationInfoDTO = {
  station: CurrentStationDTO;
  hasPrev: boolean;
  hasNext: boolean;
};

export const currentStationDTOSchema = {
  oneOf: [
    stationDTOSchema,
    {
      type: 'object',
      properties: {
        id: {
          type: 'null',
        },
      },
      required: ['id'],
    },
  ],
  nullable: true,
};

export const currentStationInfoDTOSchema = {
  type: 'object',
  properties: {
    station: currentStationDTOSchema,
    hasPrev: {
      type: 'boolean',
      example: true,
    },
    hasNext: {
      type: 'boolean',
      example: false,
    },
  },
  required: ['station', 'hasPrev', 'hasNext'],
};
