"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/shared/lib/db";
import { requireUser } from "@/processes/auth/guard";
import { authorizeDocument } from "@/processes/auth/authorizeDocument";
import { commentRepository } from "@/entities/comment/repository";
import { toAppError } from "@/shared/lib/errors";

export type ActionResult = { ok: boolean; error?: string };

const MAX_COMMENT = 2000;

/** Add a comment (any user with view access). Body is stored/rendered as text. */
export async function addCommentAction(formData: FormData): Promise<ActionResult> {
  const user = await requireUser();
  const documentId = String(formData.get("documentId") ?? "");
  const body = String(formData.get("body") ?? "").trim();

  if (body.length === 0) return { ok: false, error: "Komentar tidak boleh kosong" };
  if (body.length > MAX_COMMENT) return { ok: false, error: "Komentar terlalu panjang" };

  try {
    await authorizeDocument(db, user, documentId, "document:read");
    await commentRepository(db).add({ documentId, authorId: user.id, body });
    revalidatePath(`/documents/${documentId}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: toAppError(err).publicMessage };
  }
}
