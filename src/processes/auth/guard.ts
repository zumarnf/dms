import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/shared/lib/auth";
import { assertCan, type SessionUser } from "@/shared/lib/rbac";
import type { Action } from "@/shared/config/permissions";
import type { Role } from "@/shared/config/permissions";

/** Read the current session user (or null) on the server. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;
  return {
    id: session.user.id,
    role: (session.user as { role?: Role }).role ?? "viewer",
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
  if (!session?.user) redirect("/login");
  const u = session.user as { id: string; name: string; email: string; role?: Role };
  return { id: u.id, name: u.name, email: u.email, role: u.role ?? "viewer" };
}

/** Require a session AND a capability; throws ForbiddenError when not permitted. */
export async function requireCan(action: Action): Promise<SessionUser> {
  const user = await requireUser();
  assertCan(user, action);
  return user;
}
