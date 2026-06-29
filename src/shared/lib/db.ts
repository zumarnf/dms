import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/shared/config/env";

/**
 * Single PostgreSQL connection pool reused across the server runtime.
 * Cached on globalThis to survive HMR in development (avoids connection leaks).
 */
const globalForDb = globalThis as unknown as { __dmsClient?: ReturnType<typeof postgres> };

const client =
  globalForDb.__dmsClient ??
  postgres(env.DATABASE_URL, {
    max: env.NODE_ENV === "production" ? 10 : 5,
    prepare: true,
  });

if (env.NODE_ENV !== "production") globalForDb.__dmsClient = client;

export const db = drizzle(client);
export type DB = typeof db;
