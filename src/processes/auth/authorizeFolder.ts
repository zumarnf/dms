import type { Db } from "@/shared/lib/db-types";
import { assertCan, type SessionUser } from "@/shared/lib/rbac";
import type { Action } from "@/shared/config/permissions";
import { NotFoundError } from "@/shared/lib/errors";
import { folderRepository } from "@/entities/folder/repository";
import type { Folder } from "@/entities/folder/schema";

/**
 * Object-level authorization for a folder action. Folders are owner-scoped (no
 * folder sharing in the MVP); privileged roles pass via the capability check.
 */
export async function authorizeFolder(
  db: Db,
  user: SessionUser,
  folderId: string,
  action: Action,
): Promise<Folder> {
  const folder = await folderRepository(db).getById(folderId);
  if (!folder) throw new NotFoundError("Folder tidak ditemukan");
  assertCan(user, action, { ownerId: folder.ownerId });
  return folder;
}
