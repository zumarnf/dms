"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/shared/lib/db";
import { storage } from "@/shared/lib/storage-server";
import { requireUser } from "@/processes/auth/guard";
import { authorizeDocument } from "@/processes/auth/authorizeDocument";
import { auditRepository } from "@/entities/audit/repository";
import { versionRepository } from "@/entities/version/repository";
import { documentRepository } from "@/entities/document/repository";
import { toAppError } from "@/shared/lib/errors";
import { addVersion } from "./service";

export type ActionResult = { ok: boolean; error?: string };

/** Upload a new version of an existing document (requires edit access). */
export async function addVersionAction(formData: FormData): Promise<ActionResult> {
  const user = await requireUser();
  const documentId = String(formData.get("documentId") ?? "");
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Tidak ada file yang dipilih" };
  }

  try {
    const doc = await authorizeDocument(db, user, documentId, "document:update");
    const bytes = new Uint8Array(await file.arrayBuffer());
    await addVersion({ db, storage }, doc, user.id, {
      name: file.name,
      mimeType: file.type,
      bytes,
    });
    await auditRepository(db).log({
      actorId: user.id,
      action: "document.version",
      targetType: "document",
      targetId: documentId,
    });
    revalidatePath(`/documents/${documentId}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: toAppError(err).publicMessage };
  }
}

/** Set a specific version as the active one (requires edit access). */
export async function setCurrentVersionAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const documentId = String(formData.get("documentId") ?? "");
  const versionId = String(formData.get("versionId") ?? "");

  await authorizeDocument(db, user, documentId, "document:update");
  // setCurrent also syncs the document title to the chosen version's filename.
  const version = await versionRepository(db).setCurrent(documentId, versionId);
  await documentRepository(db).setSearchText(
    documentId,
    [version.fileName, version.extractedText].filter(Boolean).join(" "),
  );
  revalidatePath(`/documents/${documentId}`);
}
