/**
 * RBAC capability matrix. Roles grant coarse capabilities; resource-level
 * ownership and share grants refine them in `shared/lib/rbac.ts` and repositories.
 */

export const ROLES = ["admin", "manager", "contributor", "viewer"] as const;
export type Role = (typeof ROLES)[number];

export type Action =
  | "document:create"
  | "document:read"
  | "document:update"
  | "document:delete"
  | "document:share"
  | "folder:create"
  | "folder:update"
  | "folder:delete"
  | "user:manage"
  | "audit:read";

/** Share levels granted per resource, ordered by privilege. */
export const SHARE_LEVELS = ["view", "edit", "manage"] as const;
export type ShareLevel = (typeof SHARE_LEVELS)[number];

export const SHARE_RANK: Record<ShareLevel, number> = { view: 1, edit: 2, manage: 3 };

/** Minimum share level required to perform a document action on a non-owned resource. */
export const ACTION_REQUIRED_LEVEL: Partial<Record<Action, ShareLevel>> = {
  "document:read": "view",
  "document:update": "edit",
  "document:delete": "manage",
  "document:share": "manage",
};

const ALL_ACTIONS: readonly Action[] = [
  "document:create",
  "document:read",
  "document:update",
  "document:delete",
  "document:share",
  "folder:create",
  "folder:update",
  "folder:delete",
  "user:manage",
  "audit:read",
];

/** Coarse role -> allowed actions. */
export const ROLE_GRANTS: Record<Role, ReadonlySet<Action>> = {
  admin: new Set(ALL_ACTIONS),
  manager: new Set<Action>([
    "document:create",
    "document:read",
    "document:update",
    "document:delete",
    "document:share",
    "folder:create",
    "folder:update",
    "folder:delete",
    "audit:read",
  ]),
  contributor: new Set<Action>([
    "document:create",
    "document:read",
    "document:update",
    "document:delete",
    "folder:create",
    "folder:update",
  ]),
  viewer: new Set<Action>(["document:read"]),
};
