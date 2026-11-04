type CurrentSongDTO = {
  id: string;
  name: string;
  authors: string;
  album: string;
  imageUrl: string | null;
  duration: number;
};

export type CurrentSongInfoDTO = { song: CurrentSongDTO | null };

export const currentSongInfoDTOSchema = {
  type: 'object',
  properties: {
    song: {
      oneOf: [
        {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              example: 'Bohemian Rhapsody',
            },
            authors: {
              type: 'string',
              example: 'Queen',
            },
            album: {
              type: 'string',
              example: 'A Night at the Opera',
            },
            duration: {
              type: 'number',
              example: '20000',
            },
          },
          required: ['name', 'authors', 'album', 'duration'],
        },
        {
          type: 'object',
          nullable: true,
          example: null,
        },
      ],
    },
  },
  required: ['song'],
};
