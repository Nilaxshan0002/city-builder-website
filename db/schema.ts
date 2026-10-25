import { pgTable, text, jsonb, timestamp } from 'drizzle-orm/pg-core'
export const cities = pgTable('cities', {
  id: text().primaryKey(),
  state: jsonb().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
