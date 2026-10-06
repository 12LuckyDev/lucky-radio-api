import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { ICacheRepository } from './cache.repository.interface';
import { DatabaseService } from 'src/database/database.service';
import { cacheTable } from 'src/database/schema';
import { CacheModel, CacheValue, CacheValueType } from '../cache.types';

@Injectable()
export class CacheRepository implements ICacheRepository {
  constructor(private readonly database: DatabaseService) {}

  async get(key: string): Promise<CacheModel | null> {
    const [entry] = await this.database.db
      .select()
      .from(cacheTable)
      .where(eq(cacheTable.key, key))
      .limit(1);

    if (!entry) return null;

    return {
      key: entry.key,
      value: this.deserialize(entry.value, entry.type),
      type: entry.type,
    };
  }

  async set(key: string, value: CacheValue): Promise<void> {
    const type = this.getType(value);

    await this.database.db
      .insert(cacheTable)
      .values({
        key,
        value: String(value),
        type,
      })
      .onConflictDoUpdate({
        target: cacheTable.key,
        set: {
          value: String(value),
          type,
        },
      });
  }

  async delete(key: string): Promise<boolean> {
    const result = await this.database.db
      .delete(cacheTable)
      .where(eq(cacheTable.key, key));

    return result.rowsAffected > 0;
  }

  async has(key: string): Promise<boolean> {
    const [entry] = await this.database.db
      .select({ key: cacheTable.key })
      .from(cacheTable)
      .where(eq(cacheTable.key, key))
      .limit(1);

    return entry !== undefined;
  }

  private getType(value: CacheValue): CacheValueType {
    switch (typeof value) {
      case 'string':
        return 'string';

      case 'number':
        return 'number';

      case 'boolean':
        return 'boolean';
    }
  }

  private deserialize(value: string, type: CacheValueType): CacheValue {
    switch (type) {
      case 'string':
        return value;

      case 'number':
        return Number(value);

      case 'boolean':
        return value === 'true';
    }
  }
}
