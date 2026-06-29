import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { createTestDb, seedUser } from "../helpers/testDb";
import { documentRepository } from "@/entities/document/repository";
import { permissions } from "@/entities/permission/schema";
import { documents } from "@/entities/document/schema";
import { ForbiddenError, NotFoundError } from "@/shared/lib/errors";
import type { SessionUser } from "@/shared/lib/rbac";
import type { Db } from "@/shared/lib/db-types";

let db: Db;
let repo: ReturnType<typeof documentRepository>;

const alice: SessionUser = { id: "user-alice", role: "contributor" };
const bob: SessionUser = { id: "user-bob", role: "contributor" };
const admin: SessionUser = { id: "user-admin", role: "admin" };

const pagination = { page: 1, pageSize: 20 };

beforeAll(async () => {
  ({ db } = await createTestDb());
  repo = documentRepository(db);
  await seedUser(db, { id: alice.id, email: "alice@x.com" });
  await seedUser(db, { id: bob.id, email: "bob@x.com" });
  await seedUser(db, { id: admin.id, email: "admin@x.com", role: "admin" });
});

beforeEach(async () => {
  await db.delete(permissions);
  await db.delete(documents);
});

async function makeDoc(ownerId: string, title = "Doc") {
  return repo.create({ title, ownerId });
}

describe("documentRepository access scoping (anti-IDOR)", () => {
  it("owner can read own document", async () => {
    const doc = await makeDoc(alice.id);
    await expect(repo.findAccessibleById(doc.id, alice)).resolves.toMatchObject({ id: doc.id });
  });

  it("another user cannot read a document not shared with them", async () => {
    const doc = await makeDoc(alice.id);
    await expect(repo.findAccessibleById(doc.id, bob)).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("admin can read any document", async () => {
    const doc = await makeDoc(alice.id);
    await expect(repo.findAccessibleById(doc.id, admin)).resolves.toMatchObject({ id: doc.id });
  });

  it("a user with an explicit share grant can read", async () => {
    const doc = await makeDoc(alice.id);
    await db.insert(permissions).values({
      resourceType: "document",
      resourceId: doc.id,
      granteeType: "user",
      granteeId: bob.id,
      level: "view",
      grantedBy: alice.id,
    });
    await expect(repo.findAccessibleById(doc.id, bob)).resolves.toMatchObject({ id: doc.id });
  });

  it("missing document throws NotFound", async () => {
    await expect(
      repo.findAccessibleById("00000000-0000-0000-0000-000000000000", alice),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("documentRepository listing + soft delete", () => {
  it("lists only accessible documents", async () => {
    await makeDoc(alice.id, "A1");
    await makeDoc(bob.id, "B1");
    expect(await repo.listAccessible(alice, pagination)).toHaveLength(1);
    expect(await repo.listAccessible(admin, pagination)).toHaveLength(2);
  });

  it("soft delete hides the document, restore brings it back", async () => {
    const doc = await makeDoc(alice.id);
    await repo.softDelete(doc.id);
    expect(await repo.listAccessible(alice, pagination)).toHaveLength(0);
    await expect(repo.findAccessibleById(doc.id, alice)).rejects.toBeInstanceOf(NotFoundError);

    await repo.restore(doc.id);
    expect(await repo.listAccessible(alice, pagination)).toHaveLength(1);
  });
});
