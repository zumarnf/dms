import { describe, it, expect } from "vitest";
import { isActiveStatus } from "@/shared/config/permissions";

describe("isActiveStatus", () => {
  it("allows an active account", () => {
    expect(isActiveStatus("active")).toBe(true);
  });

  it("denies a disabled account (cannot use an existing session)", () => {
    expect(isActiveStatus("disabled")).toBe(false);
  });

  it("denies any unknown non-active status (fail-closed)", () => {
    expect(isActiveStatus("suspended")).toBe(false);
    expect(isActiveStatus("")).toBe(false);
  });

  it("treats a missing status as active (backward compatible)", () => {
    expect(isActiveStatus(undefined)).toBe(true);
    expect(isActiveStatus(null)).toBe(true);
  });
});
