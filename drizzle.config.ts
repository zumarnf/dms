import { defineConfig } from "drizzle-kit";
import { loadEnvConfig } from "@next/env";

// drizzle-kit runs outside Next's runtime, so load .env.local the same way Next does.
loadEnvConfig(process.cwd());

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required for drizzle-kit");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema/index.ts",
  out: "./src/db/migrations",
  dbCredentials: { url: databaseUrl },
  strict: true,
  verbose: true,
});
