import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { users } from "../user/schema";
import { folders } from "../folder/schema";
import { tsvector } from "../../db/custom-types";

/**
 * Documents. `searchTsv` powers full-text search (GIN index). `currentVersionId`
 * points to the active version (no hard FK to avoid a circular dependency with
 * document_versions; integrity is enforced in the service layer).
 */
export const documents = pgTable(
  "documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    description: text("description"),
    folderId: uuid("folder_id").references(() => folders.id, { onDelete: "set null" }),
    ownerId: text("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    category: text("category"),
    currentVersionId: uuid("current_version_id"),
    searchTsv: tsvector("search_tsv"),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("documents_owner_idx").on(t.ownerId),
    index("documents_folder_idx").on(t.folderId),
    index("documents_search_idx").using("gin", t.searchTsv),
  ],
);

export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
