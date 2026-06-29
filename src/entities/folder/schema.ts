import { pgTable, uuid, text, timestamp, index, type AnyPgColumn } from "drizzle-orm/pg-core";
import { users } from "../user/schema";

/** Folder hierarchy. `parentId` self-references for nesting; soft-deleted via `deletedAt`. */
export const folders = pgTable(
  "folders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    parentId: uuid("parent_id").references((): AnyPgColumn => folders.id, { onDelete: "set null" }),
    ownerId: text("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("folders_owner_idx").on(t.ownerId), index("folders_parent_idx").on(t.parentId)],
);

export type Folder = typeof folders.$inferSelect;
export type NewFolder = typeof folders.$inferInsert;
