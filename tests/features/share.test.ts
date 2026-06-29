import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { createTestDb, seedUser } from "../helpers/testDb";
import { shareDocument } from "@/features/document-share/api/service";
import { documentRepository } from "@/entities/document/repository";
import { notificationRepository } from "@/entities/notification/repository";
import { permissionRepository } from "@/entities/permission/repository";
import { documents } from "@/entities/document/schema";
import { permissions } from "@/entities/permission/schema";
import { notifications } from "@/entities/notification/schema";
import { ValidationError } from "@/shared/lib/errors";
import type { Db } from "@/shared/lib/db-types";
import type { SessionUser } from "@/shared/lib/rbac";

let db: Db;
const alice: SessionUser = { id: "u-alice", role: "contributor" };
const bob: SessionUser = { id: "u-bob", role: "viewer" };
const pagination = { page: 1, pageSize: 20 };

beforeAll(async () => {
  ({ db } = await createTestDb());
  await seedUser(db, { id: alice.id, email: "alice@x.com" });
  await seedUser(db, { id: bob.id, email: "bob@x.com", role: "viewer" });
});

beforeEach(async () => {
  await db.delete(notifications);
  await db.delete(permissions);
  await db.delete(documents);
});

describe("shareDocument", () => {
  it("grants a user access and notifies them", async () => {
    const doc = await documentRepository(db).create({ title: "Kontrak", ownerId: alice.id });

    await shareDocument(db, {
      documentId: doc.id,
      title: doc.title,
      ownerId: alice.id,
      actorId: alice.id,
      level: "view",
      granteeType: "user",
      email: "bob@x.com",
    });

    // Bob (not owner, no role privilege) now reaches the document.
    await expect(documentRepository(db).findAccessibleById(doc.id, bob)).resolves.toMatchObject({
      id: doc.id,
    });
    expect(await permissionRepository(db).effectiveLevel("document", doc.id, bob)).toBe("view");
    expect(await notificationRepository(db).countUnread(bob.id)).toBe(1);
  });

  it("rejects sharing with an unknown email", async () => {
    const doc = await documentRepository(db).create({ title: "X", ownerId: alice.id });
    await expect(
      shareDocument(db, {
        documentId: doc.id,
        title: "X",
        ownerId: alice.id,
        actorId: alice.id,
        level: "view",
        granteeType: "user",
        email: "ghost@x.com",
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("rejects self-share by the owner", async () => {
    const doc = await documentRepository(db).create({ title: "Y", ownerId: alice.id });
    await expect(
      shareDocument(db, {
        documentId: doc.id,
        title: "Y",
        ownerId: alice.id,
        actorId: alice.id,
        level: "view",
        granteeType: "user",
        email: "alice@x.com",
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });
});
