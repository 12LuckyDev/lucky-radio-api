import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const stationsTable = sqliteTable('stations', {
  id: text('id').primaryKey(),
  idx: integer('idx').notNull().unique(),
  name: text('name').notNull().unique(),
  url: text('url').notNull(),
});
