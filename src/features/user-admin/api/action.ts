"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/shared/lib/db";
import { requireCan } from "@/processes/auth/guard";
import { userRepository } from "@/entities/user/repository";
import { auditRepository } from "@/entities/audit/repository";
import { ROLES, type Role } from "@/shared/config/permissions";

/** Change a user's role (admin only). No-op on self to avoid lockout. */
export async function setUserRoleAction(formData: FormData): Promise<void> {
  const actor = await requireCan("user:manage");
  const userId = String(formData.get("userId") ?? "");
  const role = String(formData.get("role") ?? "") as Role;

  if (!ROLES.includes(role) || userId === actor.id) return;

  await userRepository(db).setRole(userId, role);
  await auditRepository(db).log({
    actorId: actor.id,
    action: "user.role_change",
    targetType: "user",
    metadata: { userId, role },
  });
  revalidatePath("/admin/users");
}

/** Enable/disable a user account (admin only). No-op on self. */
export async function setUserStatusAction(formData: FormData): Promise<void> {
  const actor = await requireCan("user:manage");
  const userId = String(formData.get("userId") ?? "");
  const status = String(formData.get("status") ?? "");

  if ((status !== "active" && status !== "disabled") || userId === actor.id) return;

  await userRepository(db).setStatus(userId, status);
  await auditRepository(db).log({
    actorId: actor.id,
    action: "user.status_change",
    targetType: "user",
    metadata: { userId, status },
  });
  revalidatePath("/admin/users");
}
