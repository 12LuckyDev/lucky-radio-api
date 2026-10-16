export type CommandResult<T = unknown> =
  | true
  | { result: T }
  | { error: string; type?: 'forbidden' | 'notFound' | 'conflict' };
