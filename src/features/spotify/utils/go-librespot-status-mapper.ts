import { PlayerState } from 'src/features/shared';
import { LibrespotStatus } from '../go-librespot/models';
import { CurrentSongInfoDTO } from '../dto/current-song-info.dto';

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

  public static toCurrentSong(
    model: LibrespotStatus | null,
  ): CurrentSongInfoDTO {
    if (model === null || model.track === null) return { song: null };

    const { name, album_name, artist_names } = model.track;

    const song = {
      name,
      authors: artist_names.join(','),
      album: album_name,
    };

    return { song };
  }
}
