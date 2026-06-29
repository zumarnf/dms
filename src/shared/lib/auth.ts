import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/shared/lib/db";
import { env } from "@/shared/config/env";

/**
 * Better Auth server instance. Credentials are hashed and stored in `accounts`;
 * sessions use secure cookies. `role`/`status` are server-managed fields the
 * client cannot set at sign-up (`input: false`) — prevents privilege escalation.
 */
export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", usePlural: true }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    minPasswordLength: 8,
  },
  user: {
    additionalFields: {
      role: { type: "string", required: false, defaultValue: "contributor", input: false },
      status: { type: "string", required: false, defaultValue: "active", input: false },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh daily
  },
  // Built-in brute-force protection (FR-1.4).
  rateLimit: { enabled: true, window: 60, max: 100 },
  advanced: {
    cookiePrefix: "dms",
  },
  plugins: [nextCookies()],
});

export type Auth = typeof auth;
