import {
  ConflictException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CommandResult } from './command-result';

export class CommandResultMapper {
  public static map<T = undefined>(result: CommandResult<T>): T {
    if (result === true) return undefined as T;

    if ('error' in result) {
      const { error, type } = result;

      switch (type) {
        case 'forbidden':
          throw new ForbiddenException(error);
        case 'conflict':
          throw new ConflictException(error);
        case 'notFound':
          throw new NotFoundException(error);
        default:
          throw new InternalServerErrorException(error);
      }
    }

    return result.result;
  }

  public static getResult<T>(result: CommandResult<T>, fallback: T): T;
  public static getResult<T>(
    result: CommandResult<T>,
    fallback?: null,
  ): T | null;
  public static getResult<T>(
    result: CommandResult<T>,
    fallback: T | null = null,
  ): T | null {
    if (typeof result !== 'boolean' && 'result' in result) {
      return result.result;
    }

    return fallback;
  }
}
