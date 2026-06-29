/**
 * Centralized error model + Result pattern for global, consistent error handling.
 * Services return `Result<T>`; Server Actions translate it to UI without leaking
 * stack traces to clients (security.md). HTTP layers map `AppError.status`.
 */

export type ErrorCode =
  | "VALIDATION"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMIT"
  | "INTERNAL";

const STATUS_BY_CODE: Record<ErrorCode, number> = {
  VALIDATION: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMIT: 429,
  INTERNAL: 500,
};

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  /** Safe message intended for end users (no internals). */
  readonly publicMessage: string;
  /** Optional structured detail kept server-side only. */
  readonly detail?: unknown;

  constructor(
    code: ErrorCode,
    publicMessage: string,
    options?: { cause?: unknown; detail?: unknown },
  ) {
    super(publicMessage, { cause: options?.cause });
    this.name = "AppError";
    this.code = code;
    this.status = STATUS_BY_CODE[code];
    this.publicMessage = publicMessage;
    this.detail = options?.detail;
  }
}

export class ValidationError extends AppError {
  constructor(message = "Data tidak valid", detail?: unknown) {
    super("VALIDATION", message, { detail });
    this.name = "ValidationError";
  }
}
export class UnauthorizedError extends AppError {
  constructor(message = "Anda belum masuk") {
    super("UNAUTHORIZED", message);
    this.name = "UnauthorizedError";
  }
}
export class ForbiddenError extends AppError {
  constructor(message = "Anda tidak punya akses") {
    super("FORBIDDEN", message);
    this.name = "ForbiddenError";
  }
}
export class NotFoundError extends AppError {
  constructor(message = "Data tidak ditemukan") {
    super("NOT_FOUND", message);
    this.name = "NotFoundError";
  }
}
export class ConflictError extends AppError {
  constructor(message = "Terjadi konflik data") {
    super("CONFLICT", message);
    this.name = "ConflictError";
  }
}
export class RateLimitError extends AppError {
  constructor(message = "Terlalu banyak percobaan, coba lagi nanti") {
    super("RATE_LIMIT", message);
    this.name = "RateLimitError";
  }
}

/** Discriminated Result — avoids throwing across the service boundary. */
export type Result<T> = { ok: true; data: T } | { ok: false; error: AppError };

export const ok = <T>(data: T): Result<T> => ({ ok: true, data });
export const err = (error: AppError): Result<never> => ({ ok: false, error });

/** Normalize any thrown value into an AppError (unknowns become a generic 500). */
export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;
  return new AppError("INTERNAL", "Terjadi kesalahan tak terduga", { cause: error });
}
