import { StationModel } from './station.model';

export type CurrentStationModel =
  | StationModel
  | {
      id: null;
    }
  | null;
