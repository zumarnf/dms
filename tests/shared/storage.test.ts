import { describe, it, expect } from "vitest";
import {
  assertValidUpload,
  buildStorageKey,
  sanitizeFilename,
  MAX_FILE_SIZE_BYTES,
} from "@/shared/lib/storage";
import { ValidationError } from "@/shared/lib/errors";

describe("storage validation", () => {
  it("accepts an allowed type within the size limit", () => {
    expect(() =>
      assertValidUpload({ name: "a.pdf", mimeType: "application/pdf", size: 1024 }),
    ).not.toThrow();
  });

  it("rejects a disallowed mime type", () => {
    expect(() =>
      assertValidUpload({ name: "a.exe", mimeType: "application/x-msdownload", size: 10 }),
    ).toThrow(ValidationError);
  });

  it("rejects files over the size limit", () => {
    expect(() =>
      assertValidUpload({
        name: "a.pdf",
        mimeType: "application/pdf",
        size: MAX_FILE_SIZE_BYTES + 1,
      }),
    ).toThrow(ValidationError);
  });

  it("rejects zero/invalid sizes", () => {
    expect(() =>
      assertValidUpload({ name: "a.pdf", mimeType: "application/pdf", size: 0 }),
    ).toThrow(ValidationError);
  });
});

describe("filename + key", () => {
  it("sanitizes path traversal and unsafe chars", () => {
    expect(sanitizeFilename("../../etc/pa ss wd.txt")).toBe("pa_ss_wd.txt");
    expect(sanitizeFilename("réport final!.pdf")).toBe("r_port_final_.pdf");
  });

  it("builds a deterministic storage key", () => {
    expect(buildStorageKey("doc-1", 2, "Invoice 2026.pdf")).toBe(
      "documents/doc-1/v2/Invoice_2026.pdf",
    );
  });
});
