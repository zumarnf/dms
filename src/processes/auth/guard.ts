import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/shared/lib/auth";
import { assertCan, type SessionUser } from "@/shared/lib/rbac";
import { isActiveStatus, type Action, type Role } from "@/shared/config/permissions";

/**
 * Read the current session user (or null) on the server. A disabled account is
 * treated as having no session, so an existing cookie can no longer be used
 * (security.md: authorization enforced server-side, fail-closed).
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;
  const u = session.user as { role?: Role; status?: string };
  if (!isActiveStatus(u.status)) return null;
  return {
    id: session.user.id,
    role: u.role ?? "viewer",
  };
}

/** Require a session; redirect to login when absent (for protected pages). */
export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

export type SessionProfile = SessionUser & { name: string; email: string };

/** Require a session and return display info (name/email) for the shell. */
export async function requireProfile(): Promise<SessionProfile> {
  const session = await auth.api.getSession({ headers: await headers() });
  const u = session?.user as
    { id: string; name: string; email: string; role?: Role; status?: string } | undefined;
  // Disabled accounts are bounced to login like an absent session.
  if (!u || !isActiveStatus(u.status)) redirect("/login");
  return { id: u.id, name: u.name, email: u.email, role: u.role ?? "viewer" };
}

/** Require a session AND a capability; throws ForbiddenError when not permitted. */
export async function requireCan(action: Action): Promise<SessionUser> {
  const user = await requireUser();
  assertCan(user, action);
  return user;
}
