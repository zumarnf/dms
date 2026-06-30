import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { createTestDb, seedUser } from "../helpers/testDb";
import { MemoryStorageDriver } from "../helpers/memStorage";
import { createDocumentFromUpload } from "@/features/document-upload/api/service";
import { addVersion } from "@/features/document-versioning/api/service";
import { documentRepository } from "@/entities/document/repository";
import { versionRepository } from "@/entities/version/repository";
import { documents } from "@/entities/document/schema";
import { NotFoundError } from "@/shared/lib/errors";
import type { Db } from "@/shared/lib/db-types";

let db: Db;
let docs: ReturnType<typeof documentRepository>;
let versions: ReturnType<typeof versionRepository>;
const alice = "u-alice";
const enc = (s: string) => new TextEncoder().encode(s);
const pdf = (name: string, body: string) => ({
  name,
  mimeType: "application/pdf",
  bytes: enc(body),
});

beforeAll(async () => {
  ({ db } = await createTestDb());
  docs = documentRepository(db);
  versions = versionRepository(db);
  await seedUser(db, { id: alice, email: "a@x.com", name: "Alice" });
});

beforeEach(async () => {
  await db.delete(documents);
});

describe("version filename → document title", () => {
  it("stores each version's filename and follows the newest upload as the title", async () => {
    const storage = new MemoryStorageDriver();
    const doc = await createDocumentFromUpload({ db, storage }, alice, pdf("first.pdf", "a"));
    expect((await docs.getById(doc.id))!.title).toBe("first.pdf");

    // A new version with a DIFFERENT name updates the document title (the bug fix).
    await addVersion({ db, storage }, doc, alice, pdf("second.pdf", "bb"));
    expect((await docs.getById(doc.id))!.title).toBe("second.pdf");

    const vers = await versions.listByDocument(doc.id); // newest first
    expect(vers.map((v) => v.fileName)).toEqual(["second.pdf", "first.pdf"]);
  });

  it("reverts the title to a version's filename when it is made active again", async () => {
    const storage = new MemoryStorageDriver();
    const doc = await createDocumentFromUpload({ db, storage }, alice, pdf("first.pdf", "a"));
    await addVersion({ db, storage }, doc, alice, pdf("second.pdf", "bb"));

    const vers = await versions.listByDocument(doc.id);
    const v1 = vers.find((v) => v.versionNo === 1)!;

    const returned = await versions.setCurrent(doc.id, v1.id);
    expect(returned.fileName).toBe("first.pdf");
    expect((await docs.getById(doc.id))!.title).toBe("first.pdf");
  });

  it("rejects activating a version that belongs to another document (no cross-document)", async () => {
    const storage = new MemoryStorageDriver();
    const docA = await createDocumentFromUpload({ db, storage }, alice, pdf("a.pdf", "a"));
    const docB = await createDocumentFromUpload({ db, storage }, alice, pdf("b.pdf", "b"));

    const bVersion = (await versions.listByDocument(docB.id))[0]!;
    await expect(versions.setCurrent(docA.id, bVersion.id)).rejects.toThrow(NotFoundError);
  });
});
