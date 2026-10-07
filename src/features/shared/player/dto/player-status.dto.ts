export interface PlayerStatusData {
  state: 'play' | 'stop' | 'pause';
}

export interface PlayerStatusDTO {
  connected: boolean;
  lastConnectingAttempt: Date;
  status: PlayerStatusData | null;
}

export interface PlayerStatusWithTypeDTO extends PlayerStatusDTO {
  type: string;
}

export const playerStatusWithTypeDTOSchema = {
  type: 'object',
  properties: {
    type: {
      type: 'string',
      example: 'MPD',
    },
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
        state: {
          type: 'string',
          enum: ['play', 'stop', 'pause'],
          example: 'play',
        },
      },
      required: ['state'],
    },
  },
  required: ['connected', 'lastConnectingAttempt', 'status'],
};
