import { and, eq } from "drizzle-orm";
import type { Db } from "@/shared/lib/db-types";
import type { SessionUser } from "@/shared/lib/rbac";
import { SHARE_RANK, type ShareLevel } from "@/shared/config/permissions";
import { permissions, type Permission } from "./schema";

type ResourceType = "document" | "folder";
type GranteeType = "user" | "role";

export type GrantInput = {
  resourceType: ResourceType;
  resourceId: string;
  granteeType: GranteeType;
  granteeId: string;
  level: ShareLevel;
  grantedBy?: string;
};

/** Per-resource access grant data access. */
export function permissionRepository(db: Db) {
  return {
    /** Idempotent grant: replace any existing grant for the same grantee. */
    async grant(input: GrantInput): Promise<Permission> {
      return db.transaction(async (tx) => {
        await tx
          .delete(permissions)
          .where(
            and(
              eq(permissions.resourceType, input.resourceType),
              eq(permissions.resourceId, input.resourceId),
              eq(permissions.granteeType, input.granteeType),
              eq(permissions.granteeId, input.granteeId),
            ),
          );
        const [row] = await tx.insert(permissions).values(input).returning();
        return row!;
      });
    },

    async revoke(
      resourceType: ResourceType,
      resourceId: string,
      granteeType: GranteeType,
      granteeId: string,
    ): Promise<void> {
      await db
        .delete(permissions)
        .where(
          and(
            eq(permissions.resourceType, resourceType),
            eq(permissions.resourceId, resourceId),
            eq(permissions.granteeType, granteeType),
            eq(permissions.granteeId, granteeId),
          ),
        );
    },

    async listForResource(resourceType: ResourceType, resourceId: string): Promise<Permission[]> {
      return db
        .select()
        .from(permissions)
        .where(
          and(eq(permissions.resourceType, resourceType), eq(permissions.resourceId, resourceId)),
        );
    },

    /** Highest share level the user holds on a resource (via user id or role), or null. */
    async effectiveLevel(
      resourceType: ResourceType,
      resourceId: string,
      user: SessionUser,
    ): Promise<ShareLevel | null> {
      const rows = await this.listForResource(resourceType, resourceId);
      const mine = rows.filter(
        (r) =>
          (r.granteeType === "user" && r.granteeId === user.id) ||
          (r.granteeType === "role" && r.granteeId === user.role),
      );
      if (mine.length === 0) return null;
      return mine.reduce<ShareLevel>(
        (best, r) => (SHARE_RANK[r.level] > SHARE_RANK[best] ? r.level : best),
        mine[0]!.level,
      );
    },
  };
}
