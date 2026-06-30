import { and, desc, eq, sql } from "drizzle-orm";
import type { Db } from "@/shared/lib/db-types";
import { NotFoundError } from "@/shared/lib/errors";
import { documents } from "@/entities/document/schema";
import { documentVersions, type DocumentVersion } from "./schema";

export type NewVersionInput = {
  storageKey: string;
  /** Original upload filename for this version. */
  fileName?: string;
  mimeType: string;
  sizeBytes: number;
  checksum?: string;
  extractedText?: string;
  uploadedBy?: string;
};

/** Document version data access (immutable versions, monotonic numbering). */
export function versionRepository(db: Db) {
  return {
    /**
     * Create the next version atomically and point the document at it.
     * The transaction keeps numbering and `currentVersionId` consistent.
     */
    async createNextVersion(documentId: string, input: NewVersionInput): Promise<DocumentVersion> {
      return db.transaction(async (tx) => {
        const [agg] = await tx
          .select({ max: sql<number>`coalesce(max(${documentVersions.versionNo}), 0)` })
          .from(documentVersions)
          .where(eq(documentVersions.documentId, documentId));

        const versionNo = (agg?.max ?? 0) + 1;
        const [row] = await tx
          .insert(documentVersions)
          .values({ documentId, versionNo, ...input, fileName: input.fileName ?? "" })
          .returning();

        await tx
          .update(documents)
          .set({ currentVersionId: row!.id, updatedAt: new Date() })
          .where(eq(documents.id, documentId));

        return row!;
      });
    },

    async listByDocument(documentId: string): Promise<DocumentVersion[]> {
      return db
        .select()
        .from(documentVersions)
        .where(eq(documentVersions.documentId, documentId))
        .orderBy(desc(documentVersions.versionNo));
    },

    async getByNo(documentId: string, versionNo: number): Promise<DocumentVersion | undefined> {
      const [row] = await db
        .select()
        .from(documentVersions)
        .where(
          and(
            eq(documentVersions.documentId, documentId),
            eq(documentVersions.versionNo, versionNo),
          ),
        )
        .limit(1);
      return row;
    },

    /**
     * Mark an existing version as the active one and sync the document title to
     * that version's filename. Verifies the version belongs to the document so a
     * client cannot point a document at another document's version. Returns the
     * version so callers can refresh the search vector.
     */
    async setCurrent(documentId: string, versionId: string): Promise<DocumentVersion> {
      const [version] = await db
        .select()
        .from(documentVersions)
        .where(and(eq(documentVersions.id, versionId), eq(documentVersions.documentId, documentId)))
        .limit(1);
      if (!version) throw new NotFoundError("Versi tidak ditemukan");

      await db
        .update(documents)
        .set({
          currentVersionId: version.id,
          updatedAt: new Date(),
          // Only adopt the filename when present (older versions may have none).
          ...(version.fileName ? { title: version.fileName } : {}),
        })
        .where(eq(documents.id, documentId));
      return version;
    },
  };
}
