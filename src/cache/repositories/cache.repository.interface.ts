import { CacheModel, CacheValue } from '../cache.types';

export const CACHE_REPOSITORY = Symbol('CACHE_REPOSITORY');

export interface ICacheRepository {
  get(key: string): Promise<CacheModel | null>;
  set(key: string, value: CacheValue): Promise<void>;
  delete(key: string): Promise<boolean>;
  has(key: string): Promise<boolean>;
}
