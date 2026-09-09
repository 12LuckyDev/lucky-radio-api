import { z } from 'zod';

export const createStationSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  url: z.url('Invalid URL'),
});

export const updateStationSchema = createStationSchema.partial();

export type CreateStationDTO = z.infer<typeof createStationSchema>;
export type UpdateStationDTO = z.infer<typeof updateStationSchema>;

export const createStationDTOSchema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 1,
      example: 'Radio Paradise',
      description: 'Station name',
    },
    url: {
      type: 'string',
      format: 'uri',
      example: 'https://example.com/stream.mp3',
      description: 'Station stream URL',
    },
  },
  required: ['name', 'url'],
};

export const updateStationDTOSchema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 1,
      example: 'Radio Paradise',
      description: 'Station name',
    },
    url: {
      type: 'string',
      format: 'uri',
      example: 'https://example.com/stream.mp3',
      description: 'Station stream URL',
    },
  },
};
