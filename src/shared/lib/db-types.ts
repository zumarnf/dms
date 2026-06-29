import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type * as schema from "@/db/schema";

/**
 * Shared DB type for repositories. Repositories receive a `Db` instance instead
 * of importing the singleton, so they stay testable (a PGlite-backed db is
 * injected in tests; the postgres-js singleton is injected in server code).
 */
export type Db = PostgresJsDatabase<typeof schema>;
