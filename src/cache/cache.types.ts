export type CacheValue = string | number | boolean;

export type CacheValueType = 'string' | 'number' | 'boolean';

export interface CacheModel {
  key: string;
  value: CacheValue;
  type: CacheValueType;
}
