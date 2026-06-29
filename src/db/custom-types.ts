import { customType } from "drizzle-orm/pg-core";

/** PostgreSQL `tsvector` column for full-text search (indexed with GIN). */
export const tsvector = customType<{ data: string }>({
  dataType() {
    return "tsvector";
  },
});
