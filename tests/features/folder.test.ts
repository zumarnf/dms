import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { createTestDb, seedUser } from "../helpers/testDb";
import { folderRepository } from "@/entities/folder/repository";
import { documentRepository } from "@/entities/document/repository";
import { folders } from "@/entities/folder/schema";
import { documents } from "@/entities/document/schema";
import type { Db } from "@/shared/lib/db-types";
import type { SessionUser } from "@/shared/lib/rbac";

let db: Db;
const alice: SessionUser = { id: "u-alice", role: "contributor" };
const bob: SessionUser = { id: "u-bob", role: "contributor" };
const pagination = { page: 1, pageSize: 20 };

beforeAll(async () => {
  ({ db } = await createTestDb());
  await seedUser(db, { id: alice.id, email: "a@x.com" });
  await seedUser(db, { id: bob.id, email: "b@x.com" });
});

beforeEach(async () => {
  await db.delete(documents);
  await db.delete(folders);
});

describe("folderRepository", () => {
  it("nests folders and builds a breadcrumb, scoped to the owner", async () => {
    const repo = folderRepository(db);
    const root = await repo.create({ name: "Keuangan", ownerId: alice.id });
    const child = await repo.create({ name: "2026", parentId: root.id, ownerId: alice.id });

    expect(await repo.listChildren(alice, null)).toHaveLength(1);
    const children = await repo.listChildren(alice, root.id);
    expect(children).toHaveLength(1);
    expect(children[0]!.name).toBe("2026");

    const crumbs = await repo.breadcrumb(child.id);
    expect(crumbs.map((c) => c.name)).toEqual(["Keuangan", "2026"]);

    // Bob cannot see Alice's folders.
    expect(await repo.listChildren(bob, null)).toHaveLength(0);
  });

  it("lists and moves documents between folders", async () => {
    const folder = await folderRepository(db).create({ name: "Arsip", ownerId: alice.id });
    const docs = documentRepository(db);
    const doc = await docs.create({ title: "memo.txt", ownerId: alice.id, folderId: folder.id });

    expect(await docs.listByFolder(alice, folder.id, pagination)).toHaveLength(1);

    await docs.setFolder(doc.id, null);
    expect(await docs.listByFolder(alice, folder.id, pagination)).toHaveLength(0);
  });
});
