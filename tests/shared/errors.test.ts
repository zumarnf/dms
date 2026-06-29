import { describe, it, expect } from "vitest";
import {
  AppError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  toAppError,
  ok,
  err,
} from "@/shared/lib/errors";

describe("errors", () => {
  it("maps codes to HTTP status", () => {
    expect(new ValidationError().status).toBe(400);
    expect(new ForbiddenError().status).toBe(403);
    expect(new NotFoundError().status).toBe(404);
  });

  it("toAppError passes through AppError instances", () => {
    const original = new ForbiddenError();
    expect(toAppError(original)).toBe(original);
  });

  it("toAppError wraps unknown values as INTERNAL 500", () => {
    const wrapped = toAppError(new Error("boom"));
    expect(wrapped).toBeInstanceOf(AppError);
    expect(wrapped.code).toBe("INTERNAL");
    expect(wrapped.status).toBe(500);
  });

  it("Result helpers build discriminated unions", () => {
    expect(ok(42)).toEqual({ ok: true, data: 42 });
    const e = err(new NotFoundError());
    expect(e.ok).toBe(false);
    if (!e.ok) expect(e.error.status).toBe(404);
  });
});
