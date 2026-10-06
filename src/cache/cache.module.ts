import { Global, Module } from '@nestjs/common';
import { CacheService } from './cache.service';
import { CacheRepository } from './repositories/cache.repository';
import { CACHE_REPOSITORY } from './repositories/cache.repository.interface';

@Global()
@Module({
  providers: [
    CacheService,
    {
      provide: CACHE_REPOSITORY,
      useClass: CacheRepository,
    },
  ],
  exports: [CacheService],
})
export class CacheModule {}
