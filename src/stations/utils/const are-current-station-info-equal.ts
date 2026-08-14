import { CurrentStationInfoDTO } from '../dto/current-station.dto';

export const areCurrentStationInfoEqual = (
  prev: CurrentStationInfoDTO,
  curr: CurrentStationInfoDTO,
): boolean => {
  if (prev.hasPrev !== curr.hasPrev || prev.hasNext !== curr.hasNext) {
    return false;
  }

  const prevStation = prev.station;
  const currStation = curr.station;

  if (prevStation === null || currStation === null) {
    return prevStation === currStation;
  }

  if (prevStation.id === null || currStation.id === null) {
    return prevStation.id === currStation.id;
  }

  return (
    prevStation.id === currStation.id &&
    prevStation.name === currStation.name &&
    prevStation.url === currStation.url
  );
};
