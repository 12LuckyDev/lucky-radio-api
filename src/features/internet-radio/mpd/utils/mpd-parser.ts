import mpd from 'mpd2';
import { MpdStatusModel } from '../models/mpd-status.model';

export class MpdParser {
  public static toMpdCurrentFile(value: string): string | null {
    const parsed = mpd.parseObject(value);

    if (!!parsed && 'file' in parsed && typeof parsed.file === 'string') {
      return parsed.file;
    }

    return null;
  }

  public static toMpdStatusModel(value: string): MpdStatusModel | null {
    const parsed = mpd.parseObject(value);
    if (
      !!parsed &&
      'volume' in parsed &&
      typeof parsed.volume === 'number' &&
      'state' in parsed &&
      (parsed.state === 'play' ||
        parsed.state === 'stop' ||
        parsed.state === 'pause')
    ) {
      return {
        volume: parsed.volume,
        state: parsed.state,
      };
    }

    return null;
  }
}
