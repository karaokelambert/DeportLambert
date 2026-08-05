import { pgTable, text, jsonb } from "drizzle-orm/pg-core";

// Key-value store for JL Sports Hub 360 data.
// Each top-level key (e.g. "config", "disciplina1") is one row.
export const jlSportsStore = pgTable("jlsports_store", {
  path: text("path").primaryKey(),
  data: jsonb("data").$type<Record<string, unknown>>().notNull().default({}),
});
