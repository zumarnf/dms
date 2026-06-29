"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/shared/lib/db";
import { requireCan, requireUser } from "@/processes/auth/guard";
import { authorizeFolder } from "@/processes/auth/authorizeFolder";
import { authorizeDocument } from "@/processes/auth/authorizeDocument";
import { folderRepository } from "@/entities/folder/repository";
import { documentRepository } from "@/entities/document/repository";
import { ValidationError, toAppError } from "@/shared/lib/errors";

export type ActionResult = { ok: boolean; error?: string };

const MAX_NAME = 120;

function readName(formData: FormData): string {
  const name = String(formData.get("name") ?? "").trim();
  if (name.length === 0 || name.length > MAX_NAME) {
    throw new ValidationError("Nama folder tidak valid");
  }
  return name;
}

/** Create a folder (optionally under a parent the user can access). */
export async function createFolderAction(formData: FormData): Promise<ActionResult> {
  const user = await requireCan("folder:create");
  const parentIdRaw = String(formData.get("parentId") ?? "");
  const parentId = parentIdRaw.length > 0 ? parentIdRaw : null;

  try {
    const name = readName(formData);
    if (parentId) await authorizeFolder(db, user, parentId, "folder:create");
    await folderRepository(db).create({ name, parentId, ownerId: user.id });
    revalidatePath(parentId ? `/folders/${parentId}` : "/folders");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: toAppError(err).publicMessage };
  }
}

export async function renameFolderAction(formData: FormData): Promise<ActionResult> {
  const user = await requireUser();
  const folderId = String(formData.get("folderId") ?? "");
  try {
    const name = readName(formData);
    await authorizeFolder(db, user, folderId, "folder:update");
    await folderRepository(db).rename(folderId, name);
    revalidatePath(`/folders/${folderId}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: toAppError(err).publicMessage };
  }
}

/** Soft-delete a folder then return to its parent (or root). */
export async function deleteFolderAction(formData: FormData): Promise<ActionResult> {
  const user = await requireUser();
  const folderId = String(formData.get("folderId") ?? "");
  let parentId: string | null = null;
  try {
    const folder = await authorizeFolder(db, user, folderId, "folder:delete");
    parentId = folder.parentId;
    await folderRepository(db).softDelete(folderId);
    revalidatePath("/folders");
  } catch (err) {
    return { ok: false, error: toAppError(err).publicMessage };
  }
  redirect(parentId ? `/folders/${parentId}` : "/folders");
}

/** Move a document into a folder (empty value = move to root). */
export async function moveDocumentToFolderAction(formData: FormData): Promise<ActionResult> {
  const user = await requireUser();
  const documentId = String(formData.get("documentId") ?? "");
  const folderIdRaw = String(formData.get("folderId") ?? "");
  const folderId = folderIdRaw.length > 0 ? folderIdRaw : null;

  try {
    await authorizeDocument(db, user, documentId, "document:update");
    if (folderId) await authorizeFolder(db, user, folderId, "folder:update");
    await documentRepository(db).setFolder(documentId, folderId);
    revalidatePath(`/documents/${documentId}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: toAppError(err).publicMessage };
  }
}
