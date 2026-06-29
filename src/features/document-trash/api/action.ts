"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/shared/lib/db";
import { requireUser } from "@/processes/auth/guard";
import { authorizeDocument } from "@/processes/auth/authorizeDocument";
import { assertCan } from "@/shared/lib/rbac";
import { documentRepository } from "@/entities/document/repository";
import { permissionRepository } from "@/entities/permission/repository";
import { auditRepository } from "@/entities/audit/repository";
import { NotFoundError, toAppError } from "@/shared/lib/errors";

export type ActionResult = { ok: boolean; error?: string };

/** Soft-delete a document then return to the list (requires delete access). */
export async function deleteDocumentAction(formData: FormData): Promise<ActionResult> {
  const user = await requireUser();
  const documentId = String(formData.get("documentId") ?? "");

  try {
    await authorizeDocument(db, user, documentId, "document:delete");
    await documentRepository(db).softDelete(documentId);
    await auditRepository(db).log({
      actorId: user.id,
      action: "document.delete",
      targetType: "document",
      targetId: documentId,
    });
    revalidatePath("/documents");
    revalidatePath("/trash");
  } catch (err) {
    return { ok: false, error: toAppError(err).publicMessage };
  }
  redirect("/documents");
}

/** Restore a soft-deleted document (authorized against the deleted record). */
export async function restoreDocumentAction(formData: FormData): Promise<ActionResult> {
  const user = await requireUser();
  const documentId = String(formData.get("documentId") ?? "");

  try {
    const repo = documentRepository(db);
    const doc = await repo.getById(documentId);
    if (!doc || !doc.deletedAt) throw new NotFoundError("Dokumen tidak ditemukan");

    const level = await permissionRepository(db).effectiveLevel("document", documentId, user);
    assertCan(user, "document:delete", { ownerId: doc.ownerId, shareLevel: level ?? undefined });

    await repo.restore(documentId);
    await auditRepository(db).log({
      actorId: user.id,
      action: "document.restore",
      targetType: "document",
      targetId: documentId,
    });
    revalidatePath("/trash");
    revalidatePath("/documents");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: toAppError(err).publicMessage };
  }
}
