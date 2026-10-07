import { LibrespotStatus } from '../models';

export function compareGoLibrespotStatus(
  a: LibrespotStatus | null,
  b: LibrespotStatus | null,
): boolean {
  if (a === null || b === null) {
    return a === null && b === null;
  }

  return a.stopped === b.stopped && a.paused === b.paused;
}
