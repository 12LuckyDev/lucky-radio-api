import { PlayerState } from 'src/features/shared';
import { LibrespotStatus } from '../models';

export class GoLibrespotStatusMapper {
  public static toPlayerState(status: LibrespotStatus | null): PlayerState {
    if (status === null) {
      return 'stop';
    }

    const { stopped, paused } = status;

    return stopped ? 'stop' : paused ? 'pause' : 'play';
  }

  public static toVolume(status: LibrespotStatus | null): number {
    return status?.volume ?? 0;
  }
}
