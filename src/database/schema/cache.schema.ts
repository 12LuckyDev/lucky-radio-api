import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const cacheTable = sqliteTable('cache', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  type: text('type', {
    enum: ['string', 'number', 'boolean'],
  }).notNull(),
});
