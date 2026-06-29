import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { eq } from "drizzle-orm";
import { createTestDb, seedUser } from "../helpers/testDb";
import { documentRepository } from "@/entities/document/repository";
import { versionRepository } from "@/entities/version/repository";
import { permissionRepository } from "@/entities/permission/repository";
import { auditRepository } from "@/entities/audit/repository";
import { documents } from "@/entities/document/schema";
import { permissions } from "@/entities/permission/schema";
import { auditLogs } from "@/entities/audit/schema";
import type { Db } from "@/shared/lib/db-types";
import type { SessionUser } from "@/shared/lib/rbac";

let db: Db;
let docs: ReturnType<typeof documentRepository>;
let versions: ReturnType<typeof versionRepository>;
let perms: ReturnType<typeof permissionRepository>;
let audit: ReturnType<typeof auditRepository>;

const alice: SessionUser = { id: "u-alice", role: "contributor" };
const bob: SessionUser = { id: "u-bob", role: "viewer" };
const pagination = { page: 1, pageSize: 20 };

beforeAll(async () => {
  ({ db } = await createTestDb());
  docs = documentRepository(db);
  versions = versionRepository(db);
  perms = permissionRepository(db);
  audit = auditRepository(db);
  await seedUser(db, { id: alice.id, email: "a@x.com" });
  await seedUser(db, { id: bob.id, email: "b@x.com", role: "viewer" });
});

beforeEach(async () => {
  await db.delete(auditLogs);
  await db.delete(permissions);
  await db.delete(documents);
});

describe("versionRepository", () => {
  it("numbers versions monotonically and updates currentVersionId", async () => {
    const doc = await docs.create({ title: "Spec", ownerId: alice.id });
    const v1 = await versions.createNextVersion(doc.id, {
      storageKey: "k1",
      mimeType: "application/pdf",
      sizeBytes: 10,
    });
    const v2 = await versions.createNextVersion(doc.id, {
      storageKey: "k2",
      mimeType: "application/pdf",
      sizeBytes: 20,
    });

    expect(v1.versionNo).toBe(1);
    expect(v2.versionNo).toBe(2);

    const [row] = await db.select().from(documents).where(eq(documents.id, doc.id));
    expect(row!.currentVersionId).toBe(v2.id);

    expect(await versions.listByDocument(doc.id)).toHaveLength(2);

    await versions.setCurrent(doc.id, v1.id);
    const [row2] = await db.select().from(documents).where(eq(documents.id, doc.id));
    expect(row2!.currentVersionId).toBe(v1.id);
  });
});

describe("permissionRepository", () => {
  it("grants idempotently and reports the effective level", async () => {
    const doc = await docs.create({ title: "Shared", ownerId: alice.id });

    await perms.grant({
      resourceType: "document",
      resourceId: doc.id,
      granteeType: "user",
      granteeId: bob.id,
      level: "view",
      grantedBy: alice.id,
    });
    expect(await perms.effectiveLevel("document", doc.id, bob)).toBe("view");

    // Re-grant a higher level replaces (no duplicate rows).
    await perms.grant({
      resourceType: "document",
      resourceId: doc.id,
      granteeType: "user",
      granteeId: bob.id,
      level: "manage",
      grantedBy: alice.id,
    });
    expect(await perms.listForResource("document", doc.id)).toHaveLength(1);
    expect(await perms.effectiveLevel("document", doc.id, bob)).toBe("manage");

    await perms.revoke("document", doc.id, "user", bob.id);
    expect(await perms.effectiveLevel("document", doc.id, bob)).toBeNull();
  });

  it("resolves level granted by role", async () => {
    const doc = await docs.create({ title: "RoleShared", ownerId: alice.id });
    await perms.grant({
      resourceType: "document",
      resourceId: doc.id,
      granteeType: "role",
      granteeId: "viewer",
      level: "view",
    });
    expect(await perms.effectiveLevel("document", doc.id, bob)).toBe("view");
  });
});

describe("auditRepository", () => {
  it("appends entries and filters by action", async () => {
    await audit.log({ actorId: alice.id, action: "document.upload", targetType: "document" });
    await audit.log({ actorId: alice.id, action: "document.download", targetType: "document" });

    expect(await audit.list({}, pagination)).toHaveLength(2);
    expect(await audit.list({ action: "document.upload" }, pagination)).toHaveLength(1);
  });
});
