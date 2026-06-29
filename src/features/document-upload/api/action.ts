"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/shared/lib/db";
import { storage } from "@/shared/lib/storage-server";
import { requireCan } from "@/processes/auth/guard";
import { auditRepository } from "@/entities/audit/repository";
import { toAppError } from "@/shared/lib/errors";
import { createDocumentFromUpload } from "./service";

export type UploadResult = { ok: boolean; count?: number; error?: string };

/** Server Action: validate session + capability, then store each uploaded file. */
export async function uploadDocumentsAction(formData: FormData): Promise<UploadResult> {
  // Authn/authz first (may redirect or throw ForbiddenError — intentionally uncaught).
  const user = await requireCan("document:create");

  const files = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);

  if (files.length === 0) return { ok: false, error: "Tidak ada file yang dipilih" };

  try {
    let count = 0;
    for (const file of files) {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const doc = await createDocumentFromUpload({ db, storage }, user.id, {
        name: file.name,
        mimeType: file.type,
        bytes,
      });
      await auditRepository(db).log({
        actorId: user.id,
        action: "document.upload",
        targetType: "document",
        targetId: doc.id,
      });
      count += 1;
    }
    revalidatePath("/documents");
    return { ok: true, count };
  } catch (err) {
    return { ok: false, error: toAppError(err).publicMessage };
  }
}
