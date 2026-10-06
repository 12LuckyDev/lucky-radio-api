import { Inject, Injectable } from '@nestjs/common';
import { CacheValue } from './cache.types';
import {
  CACHE_REPOSITORY,
  type ICacheRepository,
} from './repositories/cache.repository.interface';

@Injectable()
export class CacheService {
  constructor(
    @Inject(CACHE_REPOSITORY)
    private readonly cacheRepository: ICacheRepository,
  ) {}

  get<T extends CacheValue>(key: string): Promise<T | null> {
    return this.cacheRepository
      .get(key)
      .then((entry) => (entry?.value as T) ?? null);
  }

  set(key: string, value: CacheValue): Promise<void> {
    return this.cacheRepository.set(key, value);
  }

  delete(key: string): Promise<boolean> {
    return this.cacheRepository.delete(key);
  }

  has(key: string): Promise<boolean> {
    return this.cacheRepository.has(key);
  }
}
