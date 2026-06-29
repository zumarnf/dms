import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { createTestDb, seedUser } from "../helpers/testDb";
import { MemoryStorageDriver } from "../helpers/memStorage";
import { createDocumentFromUpload } from "@/features/document-upload/api/service";
import { documentRepository } from "@/entities/document/repository";
import { versionRepository } from "@/entities/version/repository";
import { documents } from "@/entities/document/schema";
import { ValidationError } from "@/shared/lib/errors";
import type { Db } from "@/shared/lib/db-types";
import type { SessionUser } from "@/shared/lib/rbac";

let db: Db;
const alice: SessionUser = { id: "u-alice", role: "contributor" };
const pagination = { page: 1, pageSize: 20 };
const enc = (s: string) => new TextEncoder().encode(s);

beforeAll(async () => {
  ({ db } = await createTestDb());
  await seedUser(db, { id: alice.id, email: "a@x.com" });
});

beforeEach(async () => {
  await db.delete(documents);
});

describe("createDocumentFromUpload", () => {
  it("stores the file, creates a first version, and indexes searchable text", async () => {
    const storage = new MemoryStorageDriver();
    const doc = await createDocumentFromUpload({ db, storage }, alice.id, {
      name: "laporan-tahunan.txt",
      mimeType: "text/plain",
      bytes: enc("laporan keuangan kuartal empat 2026"),
    });

    const versions = await versionRepository(db).listByDocument(doc.id);
    expect(versions).toHaveLength(1);
    expect(versions[0]!.versionNo).toBe(1);
    expect(storage.store.has(versions[0]!.storageKey)).toBe(true);

    const repo = documentRepository(db);
    // Found by title term...
    expect(await repo.searchAccessible(alice, pagination, "laporan")).toHaveLength(1);
    // ...and by extracted body term.
    expect(await repo.searchAccessible(alice, pagination, "keuangan")).toHaveLength(1);
    expect(await repo.searchAccessible(alice, pagination, "tidakada")).toHaveLength(0);
  });

  it("rejects a disallowed type and leaves no orphan document", async () => {
    const storage = new MemoryStorageDriver();
    await expect(
      createDocumentFromUpload({ db, storage }, alice.id, {
        name: "malware.exe",
        mimeType: "application/x-msdownload",
        bytes: enc("x"),
      }),
    ).rejects.toBeInstanceOf(ValidationError);

    expect(await documentRepository(db).listAccessible(alice, pagination)).toHaveLength(0);
  });
});
