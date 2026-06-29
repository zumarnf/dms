import type { Db } from "@/shared/lib/db-types";
import type { StorageDriver } from "@/shared/lib/storage-driver";
import { assertValidUpload, buildStorageKey } from "@/shared/lib/storage";
import { toAppError } from "@/shared/lib/errors";
import { documentRepository } from "@/entities/document/repository";
import { versionRepository } from "@/entities/version/repository";
import type { Document } from "@/entities/document/schema";
import { extractText } from "./extract";

export type UploadDeps = { db: Db; storage: StorageDriver };
export type UploadFile = { name: string; mimeType: string; bytes: Uint8Array };
export type UploadOptions = { folderId?: string; description?: string; category?: string };

/**
 * Create a document with its first version and persist the file.
 * Steps are ordered so a storage failure rolls back the document record,
 * preventing orphan rows (FR-3.6). Dependencies are injected for testability.
 */
export async function createDocumentFromUpload(
  deps: UploadDeps,
  ownerId: string,
  file: UploadFile,
  opts: UploadOptions = {},
): Promise<Document> {
  assertValidUpload({ name: file.name, mimeType: file.mimeType, size: file.bytes.length });

  const docs = documentRepository(deps.db);
  const versions = versionRepository(deps.db);
  const extracted = extractText(file.mimeType, file.bytes);

  const doc = await docs.create({
    title: file.name,
    ownerId,
    folderId: opts.folderId ?? null,
    description: opts.description ?? null,
    category: opts.category ?? null,
  });

  try {
    const key = buildStorageKey(doc.id, 1, file.name);
    await deps.storage.put(key, file.bytes);
    await versions.createNextVersion(doc.id, {
      storageKey: key,
      mimeType: file.mimeType,
      sizeBytes: file.bytes.length,
      uploadedBy: ownerId,
      extractedText: extracted,
    });
    const searchText = [file.name, opts.description, extracted].filter(Boolean).join(" ");
    await docs.setSearchText(doc.id, searchText);
    return doc;
  } catch (err) {
    // Roll back the orphaned document record (best effort).
    await docs.hardDelete(doc.id).catch(() => undefined);
    throw toAppError(err);
  }
}
