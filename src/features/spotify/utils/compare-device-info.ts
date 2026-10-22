import { DeviceInfoDTO } from '../dto/device-info.dto';

export function compareDeviceInfo(a: DeviceInfoDTO, b: DeviceInfoDTO): boolean {
  return a.name === b.name && a.type === b.type && a.username === b.username;
}
