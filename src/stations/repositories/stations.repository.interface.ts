import {
  CreateStationModel,
  StationModel,
  UpdateStationModel,
} from '../models/station.model';

export const STATIONS_REPOSITORY = Symbol('STATIONS_REPOSITORY');

export interface IStationsRepository {
  getStations(): Promise<StationModel[]>;
  getStationById(id: string): Promise<StationModel | null>;
  getStationByIdx(index: number): Promise<StationModel | null>;
  getMaxIdx(): Promise<number>;
  getNext(idx: number): Promise<StationModel | null>;
  getPrev(idx: number): Promise<StationModel | null>;
  getStationByName(name: string): Promise<StationModel | null>;
  getStationByUrl(url: string): Promise<StationModel | null>;
  createStation(station: CreateStationModel): Promise<StationModel>;
  updateStation(
    id: string,
    station: UpdateStationModel,
  ): Promise<StationModel | null>;
  deleteStation(id: string): Promise<boolean>;
}
