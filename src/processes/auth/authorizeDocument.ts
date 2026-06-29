import type { Db } from "@/shared/lib/db-types";
import { assertCan, type SessionUser } from "@/shared/lib/rbac";
import type { Action } from "@/shared/config/permissions";
import { documentRepository } from "@/entities/document/repository";
import { permissionRepository } from "@/entities/permission/repository";
import type { Document } from "@/entities/document/schema";

/**
 * Object-level authorization for a document action. Loads the document scoped to
 * the user (throws NotFound/Forbidden if unreachable), resolves the user's
 * effective share level, then asserts the capability. Returns the document so
 * callers avoid a second fetch.
 */
export async function authorizeDocument(
  db: Db,
  user: SessionUser,
  documentId: string,
  action: Action,
): Promise<Document> {
  const doc = await documentRepository(db).findAccessibleById(documentId, user);
  const level = await permissionRepository(db).effectiveLevel("document", documentId, user);
  assertCan(user, action, { ownerId: doc.ownerId, shareLevel: level ?? undefined });
  return doc;
}
