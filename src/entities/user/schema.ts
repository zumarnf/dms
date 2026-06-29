import { pgEnum, pgTable, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["admin", "manager", "contributor", "viewer"]);
export const userStatus = pgEnum("user_status", ["active", "disabled"]);

/**
 * Users. Columns are Better Auth-compatible (id is a text id; credentials live in
 * the `accounts` table, generated in Phase 3 with `usePlural`). `role`/`status`
 * are app-specific additional fields.
 */
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  role: userRole("role").notNull().default("contributor"),
  status: userStatus("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
