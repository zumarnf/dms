import { describe, it, expect } from "vitest";
import { can, assertCan, type SessionUser } from "@/shared/lib/rbac";
import { ForbiddenError } from "@/shared/lib/errors";

const admin: SessionUser = { id: "u-admin", role: "admin" };
const manager: SessionUser = { id: "u-mgr", role: "manager" };
const contributor: SessionUser = { id: "u-con", role: "contributor" };
const viewer: SessionUser = { id: "u-view", role: "viewer" };

describe("rbac.can", () => {
  it("admin can do everything", () => {
    expect(can(admin, "user:manage")).toBe(true);
    expect(can(admin, "document:delete", { ownerId: "someone-else" })).toBe(true);
  });

  it("viewer can only read documents", () => {
    expect(can(viewer, "document:read", { ownerId: "x", shareLevel: "view" })).toBe(true);
    expect(can(viewer, "document:update", { ownerId: "x", shareLevel: "edit" })).toBe(false);
    expect(can(viewer, "user:manage")).toBe(false);
  });

  it("contributor manages own documents but not others' without a share", () => {
    expect(can(contributor, "document:update", { ownerId: contributor.id })).toBe(true);
    expect(can(contributor, "document:update", { ownerId: "other" })).toBe(false);
  });

  it("contributor with sufficient share can act", () => {
    expect(can(contributor, "document:update", { ownerId: "other", shareLevel: "edit" })).toBe(
      true,
    );
    expect(can(contributor, "document:delete", { ownerId: "other", shareLevel: "edit" })).toBe(
      false,
    );
    expect(can(contributor, "document:delete", { ownerId: "other", shareLevel: "manage" })).toBe(
      true,
    );
  });

  it("manager acts on non-owned documents within capability", () => {
    expect(can(manager, "document:update", { ownerId: "other" })).toBe(true);
    expect(can(manager, "user:manage")).toBe(false);
  });

  it("non-resource actions rely on capability only", () => {
    expect(can(contributor, "document:create")).toBe(true);
    expect(can(viewer, "document:create")).toBe(false);
  });
});

describe("rbac.assertCan", () => {
  it("throws ForbiddenError when denied", () => {
    expect(() => assertCan(viewer, "user:manage")).toThrow(ForbiddenError);
  });
  it("passes silently when allowed", () => {
    expect(() => assertCan(admin, "user:manage")).not.toThrow();
  });
});
