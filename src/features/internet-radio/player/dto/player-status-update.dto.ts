export interface PlayerStatusUpdateDTO {
  connected: boolean;
  volume: number;
  state: 'play' | 'stop' | 'pause';
}

export const playerStatusUpdateDTOSchema = {
  type: 'object',
  properties: {
    connected: {
      type: 'boolean',
      example: true,
    },
    volume: {
      type: 'number',
      example: 50,
    },
    state: {
      type: 'string',
      enum: ['play', 'stop', 'pause'],
      example: 'play',
    },
  },
  required: ['connected', 'volume', 'state'],
};
