/**
 * Extract indexable text from an uploaded file. Only plain text formats are
 * read directly in the MVP; PDF/Office extraction is a planned enhancement
 * (would run in a background job). Returns undefined when not extractable.
 */
const TEXT_LIKE = new Set(["text/plain", "text/csv"]);
const MAX_EXTRACT_CHARS = 100_000;

export function extractText(mimeType: string, bytes: Uint8Array): string | undefined {
  if (!TEXT_LIKE.has(mimeType)) return undefined;
  return new TextDecoder("utf-8").decode(bytes).slice(0, MAX_EXTRACT_CHARS);
}
