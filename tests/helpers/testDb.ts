import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { migrate } from "drizzle-orm/pglite/migrator";
import * as schema from "@/db/schema";
import type { Db } from "@/shared/lib/db-types";

/**
 * In-process Postgres (PGlite) for integration tests — no Docker / no install.
 * Applies the real migrations so tests exercise the actual schema, indexes, and FKs.
 */
export async function createTestDb() {
  const client = new PGlite();
  const db = drizzle(client, { schema });
  await migrate(db, { migrationsFolder: "./src/db/migrations" });
  // Runtime is an identical Drizzle PG query builder; cast unifies the static type.
  return { db: db as unknown as Db, client };
}

/** Insert a user directly (test fixture helper). */
export async function seedUser(
  db: Db,
  overrides: Partial<typeof schema.users.$inferInsert> & { id: string },
) {
  const [user] = await db
    .insert(schema.users)
    .values({
      name: overrides.name ?? "Test User",
      email: overrides.email ?? `${overrides.id}@example.com`,
      ...overrides,
    })
    .returning();
  return user;
}
