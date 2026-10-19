type CurrentSongDTO = {
  name: string;
  authors: string;
  album: string;
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
          },
          required: ['name', 'authors', 'album'],
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
