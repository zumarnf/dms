/**
 * Development seed: creates one account per role (admin/manager/contributor/
 * viewer) with correct Better Auth credentials, plus a few sample documents so
 * sharing, search, and versioning can be tried immediately.
 *
 * Run with: `npm run db:seed` (applies to the database in .env.local).
 * Idempotent — re-running updates roles instead of duplicating accounts.
 */
import { createRequire } from "node:module";
import type { Role } from "@/shared/config/permissions";

// `@next/env` is CommonJS; load it via require so its named exports resolve under ESM/tsx.
const requireCjs = createRequire(import.meta.url);

const PASSWORD = process.env.SEED_PASSWORD ?? "Password123!";

const SEED_ACCOUNTS: { email: string; name: string; role: Role }[] = [
  { email: "admin@dms.test", name: "Admin Demo", role: "admin" },
  { email: "manager@dms.test", name: "Manager Demo", role: "manager" },
  { email: "contributor@dms.test", name: "Contributor Demo", role: "contributor" },
  { email: "viewer@dms.test", name: "Viewer Demo", role: "viewer" },
];

async function main() {
  // Load .env.local before importing anything that reads env at module load.
  const { loadEnvConfig } = requireCjs("@next/env") as typeof import("@next/env");
  loadEnvConfig(process.cwd());

  if (process.env.NODE_ENV === "production" && !process.env.SEED_ALLOW_PROD) {
    throw new Error("Refusing to seed in production (set SEED_ALLOW_PROD=1 to override).");
  }

  const { randomUUID } = await import("node:crypto");
  const { eq, sql } = await import("drizzle-orm");
  const { db } = await import("@/shared/lib/db");
  const { auth } = await import("@/shared/lib/auth");
  const { storage } = await import("@/shared/lib/storage-server");
  const { users } = await import("@/entities/user/schema");
  const { accounts } = await import("@/entities/auth/schema");
  const { documents } = await import("@/entities/document/schema");
  const { createDocumentFromUpload } = await import("@/features/document-upload/api/service");
  const { addVersion } = await import("@/features/document-versioning/api/service");

  // Better Auth's configured password hasher — guarantees the hash matches sign-in.
  const ctx = (await auth.$context) as { password: { hash(password: string): Promise<string> } };

  console.log("Seeding accounts…");
  const ownerByRole = {} as Record<Role, string>;

  for (const acc of SEED_ACCOUNTS) {
    const [existing] = await db.select().from(users).where(eq(users.email, acc.email)).limit(1);
    if (existing) {
      await db
        .update(users)
        .set({ role: acc.role, status: "active", updatedAt: new Date() })
        .where(eq(users.id, existing.id));
      ownerByRole[acc.role] = existing.id;
      console.log(`  ~ updated ${acc.email} → ${acc.role}`);
      continue;
    }

    const id = randomUUID();
    const passwordHash = await ctx.password.hash(PASSWORD);
    await db.insert(users).values({
      id,
      email: acc.email,
      name: acc.name,
      emailVerified: true,
      role: acc.role,
      status: "active",
    });
    await db.insert(accounts).values({
      id: randomUUID(),
      accountId: id,
      providerId: "credential",
      userId: id,
      password: passwordHash,
    });
    ownerByRole[acc.role] = id;
    console.log(`  + created ${acc.email} (${acc.role})`);
  }

  // Sample documents — only when none exist yet for the admin (keeps it idempotent).
  const countRows = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(documents)
    .where(eq(documents.ownerId, ownerByRole.admin));
  const count = countRows[0]?.count ?? 0;

  if (count > 0) {
    console.log("Sample documents already present — skipping.");
  } else {
    console.log("Seeding sample documents…");
    const enc = (s: string) => new TextEncoder().encode(s);
    const make = (ownerId: string, name: string, body: string) =>
      createDocumentFromUpload({ db, storage }, ownerId, {
        name,
        mimeType: "text/plain",
        bytes: enc(body),
      });

    const policy = await make(
      ownerByRole.admin,
      "Kebijakan_Keamanan.txt",
      "Kebijakan akses dan keamanan dokumen organisasi.",
    );
    // Add a second version to demonstrate versioning (title follows the newest file).
    await addVersion({ db, storage }, policy, ownerByRole.admin, {
      name: "Kebijakan_Keamanan_rev2.txt",
      mimeType: "text/plain",
      bytes: enc("Revisi 2: penambahan aturan berbagi dan audit."),
    });
    await make(ownerByRole.manager, "Laporan_Q2_2026.txt", "Ringkasan laporan kuartal kedua tim.");
    await make(ownerByRole.contributor, "Catatan_Rapat.txt", "Notulen rapat tim pekan ini.");
    console.log("  + sample documents created");
  }

  console.log(`\nDone. Sign in with any of these, password: ${PASSWORD}`);
  for (const a of SEED_ACCOUNTS) console.log(`  - ${a.email}  (${a.role})`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
