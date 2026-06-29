import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { createTestDb, seedUser } from "../helpers/testDb";
import { MemoryStorageDriver } from "../helpers/memStorage";
import { createDocumentFromUpload } from "@/features/document-upload/api/service";
import { addVersion } from "@/features/document-versioning/api/service";
import { documentRepository } from "@/entities/document/repository";
import { versionRepository } from "@/entities/version/repository";
import { commentRepository } from "@/entities/comment/repository";
import { documents } from "@/entities/document/schema";
import type { Db } from "@/shared/lib/db-types";
import type { SessionUser } from "@/shared/lib/rbac";

let db: Db;
const alice: SessionUser = { id: "u-alice", role: "contributor" };
const pagination = { page: 1, pageSize: 20 };
const enc = (s: string) => new TextEncoder().encode(s);

beforeAll(async () => {
  ({ db } = await createTestDb());
  await seedUser(db, { id: alice.id, email: "a@x.com", name: "Alice" });
});

beforeEach(async () => {
  await db.delete(documents);
});

describe("document detail flow", () => {
  it("adds versions, comments, and supports trash + restore", async () => {
    const storage = new MemoryStorageDriver();
    const doc = await createDocumentFromUpload({ db, storage }, alice.id, {
      name: "a.txt",
      mimeType: "text/plain",
      bytes: enc("hello"),
    });

    await addVersion({ db, storage }, doc, alice.id, {
      name: "a.txt",
      mimeType: "text/plain",
      bytes: enc("hello v2"),
    });

    const versions = await versionRepository(db).listByDocument(doc.id);
    expect(versions).toHaveLength(2);
    expect(versions[0]!.versionNo).toBe(2); // newest first

    const comments = commentRepository(db);
    await comments.add({ documentId: doc.id, authorId: alice.id, body: "dokumen bagus" });
    const withAuthor = await comments.listWithAuthor(doc.id);
    expect(withAuthor).toHaveLength(1);
    expect(withAuthor[0]).toMatchObject({ authorName: "Alice", body: "dokumen bagus" });

    const docs = documentRepository(db);
    await docs.softDelete(doc.id);
    expect(await docs.listTrashed(alice, pagination)).toHaveLength(1);
    expect(await docs.listAccessible(alice, pagination)).toHaveLength(0);

    await docs.restore(doc.id);
    expect(await docs.listAccessible(alice, pagination)).toHaveLength(1);
    expect(await docs.listTrashed(alice, pagination)).toHaveLength(0);
  });
});
