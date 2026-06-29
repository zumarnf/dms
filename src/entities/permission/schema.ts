import { pgEnum, pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { users } from "../user/schema";

export const resourceType = pgEnum("resource_type", ["document", "folder"]);
export const granteeType = pgEnum("grantee_type", ["user", "role"]);
export const shareLevel = pgEnum("share_level", ["view", "edit", "manage"]);

/** Per-resource access grant. `granteeId` is a user id or a role name. */
export const permissions = pgTable(
  "permissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    resourceType: resourceType("resource_type").notNull(),
    resourceId: uuid("resource_id").notNull(),
    granteeType: granteeType("grantee_type").notNull(),
    granteeId: text("grantee_id").notNull(),
    level: shareLevel("level").notNull(),
    grantedBy: text("granted_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("permissions_resource_idx").on(t.resourceType, t.resourceId),
    index("permissions_grantee_idx").on(t.granteeType, t.granteeId),
  ],
);

export type Permission = typeof permissions.$inferSelect;
export type NewPermission = typeof permissions.$inferInsert;
