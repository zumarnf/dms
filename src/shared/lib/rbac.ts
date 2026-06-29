import { ForbiddenError } from "@/shared/lib/errors";
import {
  ACTION_REQUIRED_LEVEL,
  ROLE_GRANTS,
  SHARE_RANK,
  type Action,
  type Role,
  type ShareLevel,
} from "@/shared/config/permissions";

export type SessionUser = { id: string; role: Role };

/**
 * Resource context for object-level checks. When provided, access is granted
 * only to the owner, a sufficient share grant, or a manager/admin role.
 */
export type ResourceContext = {
  ownerId?: string;
  shareLevel?: ShareLevel;
};

/** Central, deny-by-default authorization decision. */
export function can(user: SessionUser, action: Action, ctx?: ResourceContext): boolean {
  if (user.role === "admin") return true;

  // Capability gate first.
  if (!ROLE_GRANTS[user.role].has(action)) return false;

  // Non-resource actions (create, user:manage, audit:read) rely on capability only.
  if (!ctx || ctx.ownerId === undefined) return true;

  // Owner always passes within their capability.
  if (ctx.ownerId === user.id) return true;

  // Managers act on resources they don't own (within capability).
  if (user.role === "manager") return true;

  // Otherwise a share grant of sufficient level is required.
  const required = ACTION_REQUIRED_LEVEL[action];
  if (!required || !ctx.shareLevel) return false;
  return SHARE_RANK[ctx.shareLevel] >= SHARE_RANK[required];
}

/** Throw a ForbiddenError when the action is not permitted (fail-closed). */
export function assertCan(user: SessionUser, action: Action, ctx?: ResourceContext): void {
  if (!can(user, action, ctx)) {
    throw new ForbiddenError();
  }
}
