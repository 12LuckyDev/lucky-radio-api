export interface PlayerStatusDTO {
  connected: boolean;
  lastConnectingAttempt: Date;
  status: {
    volume: number;
    state: 'play' | 'stop' | 'pause';
  } | null;
}

export const playerStatusDTOSchema = {
  type: 'object',
  properties: {
    connected: {
      type: 'boolean',
      example: true,
    },
    lastConnectingAttempt: {
      type: 'string',
      format: 'date-time',
      example: '2026-08-14T09:30:00.000Z',
    },
    status: {
      type: 'object',
      nullable: true,
      properties: {
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
      required: ['volume', 'state'],
    },
  },
  required: ['connected', 'lastConnectingAttempt', 'status'],
};
