import { StationDTO } from '../dto/station.dto';
import { StationModel } from '../models/station.model';

export function stationModelToDTO(model: StationModel): StationDTO {
  const { id, name, url } = model;
  return { id, name, url };
}
