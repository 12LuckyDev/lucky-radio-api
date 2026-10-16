import { PlayerState } from '../models/player-state';

export interface PlayerStateDTO {
  state: PlayerState;
}

export interface PlayerStateWithTypeDTO extends PlayerStateDTO {
  type: string;
}

const stateSchema = {
  type: 'string',
  enum: ['play', 'stop', 'pause'],
  example: 'play',
};

export const playerStateDTOSchema = {
  type: 'object',
  properties: {
    state: stateSchema,
  },
  required: ['state'],
};

export const playerStateWithTypeDTOSchema = {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      example: 'MPD',
    },
    state: stateSchema,
  },
  required: ['type', 'state'],
};
