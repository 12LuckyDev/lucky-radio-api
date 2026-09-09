export interface StationDTO {
  id: string;
  name: string;
  url: string;
}

export const stationDTOSchema = {
  type: 'object',
  properties: {
    id: {
      type: 'string',
      example: 'radio-123',
    },
    name: {
      type: 'string',
      example: 'Radio Paradise',
    },
    url: {
      type: 'string',
      format: 'uri',
      example: 'https://example.com/stream.mp3',
    },
  },
  required: ['id', 'name', 'url'],
};
