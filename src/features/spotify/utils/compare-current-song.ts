import { CurrentSongInfoDTO } from '../dto/current-song-info.dto';

export function compareCurrentSong(
  { song: a }: CurrentSongInfoDTO,
  { song: b }: CurrentSongInfoDTO,
): boolean {
  if (a === b) return true;
  if (a === null || b === null) return false;

  return a.name === b.name && a.authors === b.authors && a.album === b.album;
}
