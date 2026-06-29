import "server-only";
import pino from "pino";

/**
 * Structured server-side logger. Sensitive fields are redacted so secrets/PII
 * never reach logs (security.md). Use child loggers for request correlation.
 */
export const logger = pino({
  level: process.env.LOG_LEVEL ?? (process.env.NODE_ENV === "production" ? "info" : "debug"),
  redact: {
    paths: [
      "password",
      "passwordHash",
      "*.password",
      "*.passwordHash",
      "token",
      "*.token",
      "authorization",
      "*.authorization",
      "cookie",
      "*.cookie",
      "secret",
      "*.secret",
    ],
    censor: "[redacted]",
  },
  base: undefined,
});

export type Logger = typeof logger;
