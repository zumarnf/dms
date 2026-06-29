import { ValidationError } from "@/shared/lib/errors";

/**
 * Upload constraints (allow-list, not block-list) — security.md.
 * The S3-compatible client + presigned URL generation is added with the upload
 * feature (Phase 5), but validation lives here so it is shared and unit-tested.
 */
export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

export const ALLOWED_MIME_TYPES: Readonly<Record<string, string>> = {
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.ms-excel": "xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "application/vnd.ms-powerpoint": "ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "text/plain": "txt",
  "text/csv": "csv",
};

export type UploadCandidate = { name: string; mimeType: string; size: number };

/** Validate an upload candidate before any bytes are accepted. Throws ValidationError. */
export function assertValidUpload(file: UploadCandidate): void {
  if (!(file.mimeType in ALLOWED_MIME_TYPES)) {
    throw new ValidationError("Tipe file tidak didukung");
  }
  if (!Number.isFinite(file.size) || file.size <= 0) {
    throw new ValidationError("Ukuran file tidak valid");
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new ValidationError("Ukuran file melebihi batas 50 MB");
  }
}

/** Strip unsafe characters from a user-supplied filename. */
export function sanitizeFilename(name: string): string {
  const base = name.replace(/\\/g, "/").split("/").pop() ?? "file";
  return base.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 200) || "file";
}

/** Deterministic, collision-safe object key for a document version. */
export function buildStorageKey(
  documentId: string,
  versionNo: number,
  originalName: string,
): string {
  return `documents/${documentId}/v${versionNo}/${sanitizeFilename(originalName)}`;
}
