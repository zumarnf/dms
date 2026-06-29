import "server-only";
import { z } from "zod";

/**
 * Validated server-only environment (security.md: secrets from env, never client bundle).
 * Fails fast at boot if a required variable is missing or malformed.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  // Database
  DATABASE_URL: z.string().url(),

  // Auth (Better Auth)
  BETTER_AUTH_SECRET: z.string().min(32, "BETTER_AUTH_SECRET must be at least 32 chars"),
  BETTER_AUTH_URL: z.string().url(),

  // Local filesystem storage base directory (default ./storage at repo root).
  STORAGE_DIR: z.string().default("./storage"),
});

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (parsed.success) return parsed.data;

  // During `next build`, route modules are imported for analysis before any
  // real environment exists. Use placeholders so module evaluation succeeds;
  // strict validation still runs at server runtime (a fresh process).
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return {
      NODE_ENV: "production",
      DATABASE_URL: "postgresql://build:build@localhost:5432/build",
      BETTER_AUTH_SECRET: "build-time-placeholder-secret-not-a-real-key",
      BETTER_AUTH_URL: "http://localhost:3000",
      STORAGE_DIR: "./storage",
    };
  }

  // Do not print values — only which keys failed (no secret leakage).
  const issues = parsed.error.issues.map((i) => i.path.join(".")).join(", ");
  throw new Error(`Invalid environment variables: ${issues}`);
}

export const env = loadEnv();
export type Env = z.infer<typeof envSchema>;
