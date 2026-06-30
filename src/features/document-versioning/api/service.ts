import { randomUUID } from "node:crypto";
import type { Db } from "@/shared/lib/db-types";
import type { StorageDriver } from "@/shared/lib/storage-driver";
import { assertValidUpload, buildStorageKey } from "@/shared/lib/storage";
import { documentRepository } from "@/entities/document/repository";
import { versionRepository } from "@/entities/version/repository";
import type { Document } from "@/entities/document/schema";
import type { DocumentVersion } from "@/entities/version/schema";
import { extractText } from "@/features/document-upload/api/extract";

export type VersionDeps = { db: Db; storage: StorageDriver };
export type UploadFile = { name: string; mimeType: string; bytes: Uint8Array };

/**
 * Store a file as the next version of an existing document and refresh the
 * document's search vector. Used by both the initial upload and re-uploads.
 * The storage key uses a per-version UUID so it never depends on numbering.
 */
export async function addVersion(
  deps: VersionDeps,
  doc: Pick<Document, "id" | "title">,
  uploaderId: string,
  file: UploadFile,
): Promise<DocumentVersion> {
  assertValidUpload({ name: file.name, mimeType: file.mimeType, size: file.bytes.length });

  const extracted = extractText(file.mimeType, file.bytes);
  const token = randomUUID();
  const key = buildStorageKey(doc.id, token, file.name);

  await deps.storage.put(key, file.bytes);
  const version = await versionRepository(deps.db).createNextVersion(doc.id, {
    storageKey: key,
    fileName: file.name,
    mimeType: file.mimeType,
    sizeBytes: file.bytes.length,
    uploadedBy: uploaderId,
    extractedText: extracted,
  });

  // The new version becomes current → the document title follows its filename.
  const docs = documentRepository(deps.db);
  await docs.setTitle(doc.id, file.name);
  await docs.setSearchText(doc.id, [file.name, extracted].filter(Boolean).join(" "));
  return version;
}
