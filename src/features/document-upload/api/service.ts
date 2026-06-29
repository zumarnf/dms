import { toAppError } from "@/shared/lib/errors";
import { assertValidUpload } from "@/shared/lib/storage";
import { documentRepository } from "@/entities/document/repository";
import type { Document } from "@/entities/document/schema";
import {
  addVersion,
  type VersionDeps,
  type UploadFile,
} from "@/features/document-versioning/api/service";

export type UploadDeps = VersionDeps;
export type UploadOptions = { folderId?: string; description?: string; category?: string };

/**
 * Create a document with its first version. Ordering ensures a storage failure
 * rolls back the document record (no orphan rows — FR-3.6). Deps are injected
 * for testability.
 */
export async function createDocumentFromUpload(
  deps: UploadDeps,
  ownerId: string,
  file: UploadFile,
  opts: UploadOptions = {},
): Promise<Document> {
  // Validate before creating any record so a bad file never makes a row.
  assertValidUpload({ name: file.name, mimeType: file.mimeType, size: file.bytes.length });

  const docs = documentRepository(deps.db);

  const doc = await docs.create({
    title: file.name,
    ownerId,
    folderId: opts.folderId ?? null,
    description: opts.description ?? null,
    category: opts.category ?? null,
  });

  try {
    await addVersion(deps, doc, ownerId, file);
    return doc;
  } catch (err) {
    // Roll back the orphaned document record (best effort).
    await docs.hardDelete(doc.id).catch(() => undefined);
    throw toAppError(err);
  }
}

export type { UploadFile };
