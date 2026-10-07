import { PlayerStatusData } from 'src/features/shared';
import { LibrespotStatus } from '../models';

export class GoLibrespotStatusMapper {
  public static toPlayerStatusData(
    status: LibrespotStatus | null,
  ): PlayerStatusData | null {
    if (status === null) {
      return null;
    }

    const { stopped, paused } = status;

    return {
      state: stopped ? 'stop' : paused ? 'pause' : 'play',
    };
  }
}
