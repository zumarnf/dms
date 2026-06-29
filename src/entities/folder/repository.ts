import { and, asc, eq, isNull } from "drizzle-orm";
import type { Db } from "@/shared/lib/db-types";
import type { SessionUser } from "@/shared/lib/rbac";
import { folders, type Folder, type NewFolder } from "./schema";

function isPrivileged(user: SessionUser): boolean {
  return user.role === "admin" || user.role === "manager";
}

/** Folder data access. Folders are owned; privileged roles see all (no folder sharing in MVP). */
export function folderRepository(db: Db) {
  return {
    async create(input: NewFolder): Promise<Folder> {
      const [row] = await db.insert(folders).values(input).returning();
      return row!;
    },

    async getById(id: string): Promise<Folder | undefined> {
      const [row] = await db
        .select()
        .from(folders)
        .where(and(eq(folders.id, id), isNull(folders.deletedAt)))
        .limit(1);
      return row;
    },

    /** List non-deleted child folders under `parentId` (null = root), scoped to the user. */
    async listChildren(user: SessionUser, parentId: string | null): Promise<Folder[]> {
      const ownership = isPrivileged(user) ? undefined : eq(folders.ownerId, user.id);
      const parentClause =
        parentId === null ? isNull(folders.parentId) : eq(folders.parentId, parentId);
      return db
        .select()
        .from(folders)
        .where(and(isNull(folders.deletedAt), parentClause, ownership))
        .orderBy(asc(folders.name));
    },

    /** All non-deleted folders the user can use (e.g. as move targets). */
    async listAll(user: SessionUser): Promise<Folder[]> {
      const ownership = isPrivileged(user) ? undefined : eq(folders.ownerId, user.id);
      return db
        .select()
        .from(folders)
        .where(and(isNull(folders.deletedAt), ownership))
        .orderBy(asc(folders.name));
    },

    async rename(id: string, name: string): Promise<void> {
      await db.update(folders).set({ name, updatedAt: new Date() }).where(eq(folders.id, id));
    },

    async softDelete(id: string): Promise<void> {
      await db.update(folders).set({ deletedAt: new Date() }).where(eq(folders.id, id));
    },

    /** Path from root to the given folder (for breadcrumbs). Depth-capped against cycles. */
    async breadcrumb(id: string): Promise<Folder[]> {
      const path: Folder[] = [];
      let currentId: string | null = id;
      for (let i = 0; i < 20 && currentId; i += 1) {
        const node = await this.getById(currentId);
        if (!node) break;
        path.unshift(node);
        currentId = node.parentId;
      }
      return path;
    },
  };
}
