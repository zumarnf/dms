import {
  pgTable,
  uuid,
  text,
  integer,
  bigint,
  timestamp,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { documents } from "../document/schema";
import { users } from "../user/schema";

/** Immutable per-document versions. Each re-upload increments `versionNo`. */
export const documentVersions = pgTable(
  "document_versions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    documentId: uuid("document_id")
      .notNull()
      .references(() => documents.id, { onDelete: "cascade" }),
    versionNo: integer("version_no").notNull(),
    storageKey: text("storage_key").notNull(),
    /** Original upload filename for this version (used as the document title + download name). */
    fileName: text("file_name").notNull().default(""),
    mimeType: text("mime_type").notNull(),
    sizeBytes: bigint("size_bytes", { mode: "number" }).notNull(),
    checksum: text("checksum"),
    extractedText: text("extracted_text"),
    uploadedBy: text("uploaded_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    unique("document_versions_doc_no_uq").on(t.documentId, t.versionNo),
    index("document_versions_doc_idx").on(t.documentId),
  ],
);

export type DocumentVersion = typeof documentVersions.$inferSelect;
export type NewDocumentVersion = typeof documentVersions.$inferInsert;
