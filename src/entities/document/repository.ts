import { and, desc, eq, isNull, or, inArray, sql } from "drizzle-orm";
import type { Db } from "@/shared/lib/db-types";
import type { SessionUser } from "@/shared/lib/rbac";
import { ForbiddenError, NotFoundError } from "@/shared/lib/errors";
import { toOffsetLimit, type Pagination } from "@/shared/types";
import { toPrefixTsQuery } from "@/shared/lib/fts";
import { documents, type Document, type NewDocument } from "./schema";
import { permissions } from "@/entities/permission/schema";

/** Roles that can see every document regardless of ownership/grants. */
function isPrivileged(user: SessionUser): boolean {
  return user.role === "admin" || user.role === "manager";
}

/** Subquery of document ids explicitly shared with the user (by user id or role). */
function sharedDocumentIds(db: Db, user: SessionUser) {
  return db
    .select({ id: permissions.resourceId })
    .from(permissions)
    .where(
      and(
        eq(permissions.resourceType, "document"),
        or(
          and(eq(permissions.granteeType, "user"), eq(permissions.granteeId, user.id)),
          and(eq(permissions.granteeType, "role"), eq(permissions.granteeId, user.role)),
        ),
      ),
    );
}

/**
 * Document data access. All reads are scoped to what the user may access so an
 * untrusted client id cannot reach another user's record (prevents IDOR — FR-2.3).
 */
export function documentRepository(db: Db) {
  return {
    async create(input: NewDocument): Promise<Document> {
      const [row] = await db.insert(documents).values(input).returning();
      return row!;
    },

    /** Fetch a non-deleted document only if the user is allowed to access it. */
    async findAccessibleById(id: string, user: SessionUser): Promise<Document> {
      const [row] = await db
        .select()
        .from(documents)
        .where(and(eq(documents.id, id), isNull(documents.deletedAt)))
        .limit(1);

      if (!row) throw new NotFoundError("Dokumen tidak ditemukan");
      if (isPrivileged(user) || row.ownerId === user.id) return row;

      const shared = await sharedDocumentIds(db, user);
      if (shared.some((s) => s.id === id)) return row;

      throw new ForbiddenError();
    },

    /** List documents the user may access, newest first, paginated. */
    async listAccessible(user: SessionUser, pagination: Pagination): Promise<Document[]> {
      const { offset, limit } = toOffsetLimit(pagination);
      const visibility = isPrivileged(user)
        ? undefined
        : or(eq(documents.ownerId, user.id), inArray(documents.id, sharedDocumentIds(db, user)));

      return db
        .select()
        .from(documents)
        .where(and(isNull(documents.deletedAt), visibility))
        .orderBy(desc(documents.createdAt))
        .offset(offset)
        .limit(limit);
    },

    /**
     * Full-text search over accessible documents. Falls back to a plain list
     * when the query has no searchable terms. Always scoped to the user.
     */
    async searchAccessible(
      user: SessionUser,
      pagination: Pagination,
      query: string,
    ): Promise<Document[]> {
      const tsq = toPrefixTsQuery(query);
      if (!tsq) return this.listAccessible(user, pagination);

      const { offset, limit } = toOffsetLimit(pagination);
      const visibility = isPrivileged(user)
        ? undefined
        : or(eq(documents.ownerId, user.id), inArray(documents.id, sharedDocumentIds(db, user)));

      return db
        .select()
        .from(documents)
        .where(
          and(
            isNull(documents.deletedAt),
            sql`${documents.searchTsv} @@ to_tsquery('simple', ${tsq})`,
            visibility,
          ),
        )
        .orderBy(desc(documents.createdAt))
        .offset(offset)
        .limit(limit);
    },

    async softDelete(id: string): Promise<void> {
      await db.update(documents).set({ deletedAt: new Date() }).where(eq(documents.id, id));
    },

    async restore(id: string): Promise<void> {
      await db.update(documents).set({ deletedAt: null }).where(eq(documents.id, id));
    },

    /** Permanently remove a document (used for upload cleanup and purge). */
    async hardDelete(id: string): Promise<void> {
      await db.delete(documents).where(eq(documents.id, id));
    },

    /**
     * Rebuild the full-text search vector from the given text. Uses the
     * 'simple' config (no language-specific stemming) — safe for mixed ID/EN.
     */
    async setSearchText(id: string, text: string): Promise<void> {
      await db
        .update(documents)
        .set({ searchTsv: sql`to_tsvector('simple', ${text})` })
        .where(eq(documents.id, id));
    },
  };
}
