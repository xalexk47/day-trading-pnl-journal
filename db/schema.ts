import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
export const journalStates = sqliteTable("journal_states", {
  userId: text("user_id").primaryKey(),
  payload: text("payload").notNull(),
  revision: integer("revision").notNull(),
  updatedAt: text("updated_at").notNull(),
});
