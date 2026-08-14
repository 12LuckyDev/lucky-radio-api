import { z } from 'zod';

export const StationSchema = z.object({
  name: z.string(),
  url: z.url(),
});

export const StationsSchema = z.array(StationSchema);

export type StationType = z.infer<typeof StationSchema>;

export interface StationModel {
  id: string;
  idx: number;
  name: string;
  url: string;
}

export interface CreateStationModel {
  idx: number;
  name: string;
  url: string;
}

export interface UpdateStationModel {
  idx?: number;
  name?: string;
  url?: string;
}
