"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/shared/lib/db";
import { requireUser } from "@/processes/auth/guard";
import { authorizeDocument } from "@/processes/auth/authorizeDocument";
import { permissionRepository } from "@/entities/permission/repository";
import { auditRepository } from "@/entities/audit/repository";
import { NotFoundError, ValidationError, toAppError } from "@/shared/lib/errors";
import { ROLES, SHARE_LEVELS, type Role, type ShareLevel } from "@/shared/config/permissions";
import { shareDocument } from "./service";

export type ActionResult = { ok: boolean; error?: string };

/** Grant access to a document (requires manage/share access). */
export async function shareDocumentAction(formData: FormData): Promise<ActionResult> {
  const user = await requireUser();
  const documentId = String(formData.get("documentId") ?? "");
  const granteeType = String(formData.get("granteeType") ?? "");
  const level = String(formData.get("level") ?? "") as ShareLevel;

  if (!SHARE_LEVELS.includes(level)) return { ok: false, error: "Level akses tidak valid" };

  try {
    const doc = await authorizeDocument(db, user, documentId, "document:share");

    if (granteeType === "user") {
      const email = String(formData.get("email") ?? "");
      if (!email) throw new ValidationError("Email wajib diisi");
      await shareDocument(db, {
        documentId,
        title: doc.title,
        ownerId: doc.ownerId,
        actorId: user.id,
        level,
        granteeType: "user",
        email,
      });
    } else if (granteeType === "role") {
      const role = String(formData.get("role") ?? "") as Role;
      if (!ROLES.includes(role)) throw new ValidationError("Peran tidak valid");
      await shareDocument(db, {
        documentId,
        title: doc.title,
        ownerId: doc.ownerId,
        actorId: user.id,
        level,
        granteeType: "role",
        role,
      });
    } else {
      throw new ValidationError("Target berbagi tidak valid");
    }

    await auditRepository(db).log({
      actorId: user.id,
      action: "document.share",
      targetType: "document",
      targetId: documentId,
    });
    revalidatePath(`/documents/${documentId}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: toAppError(err).publicMessage };
  }
}

/** Revoke a specific grant (requires manage/share access on the document). */
export async function revokeShareAction(formData: FormData): Promise<ActionResult> {
  const user = await requireUser();
  const permissionId = String(formData.get("permissionId") ?? "");

  try {
    const perms = permissionRepository(db);
    const grant = await perms.getById(permissionId);
    if (!grant || grant.resourceType !== "document") {
      throw new NotFoundError("Izin tidak ditemukan");
    }
    await authorizeDocument(db, user, grant.resourceId, "document:share");
    await perms.deleteById(permissionId);
    await auditRepository(db).log({
      actorId: user.id,
      action: "document.unshare",
      targetType: "document",
      targetId: grant.resourceId,
    });
    revalidatePath(`/documents/${grant.resourceId}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: toAppError(err).publicMessage };
  }
}
