export interface DeviceInfoDTO {
  name: string | null;
  type: string | null;
  username: string | null;
}

export const deviceInfoDTOSchema = {
  type: 'object',
  properties: {
    name: {
      oneOf: [
        {
          type: 'string',
          example: 'My Device',
        },
        {
          type: 'null',
          example: null,
        },
      ],
    },
    type: {
      oneOf: [
        {
          type: 'string',
          example: 'speaker',
        },
        {
          type: 'null',
          example: null,
        },
      ],
    },
    username: {
      oneOf: [
        {
          type: 'string',
          example: 'john',
        },
        {
          type: 'null',
          example: null,
        },
      ],
    },
  },
  required: ['name', 'type', 'username'],
};
