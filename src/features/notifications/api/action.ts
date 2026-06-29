"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/shared/lib/db";
import { requireUser } from "@/processes/auth/guard";
import { notificationRepository } from "@/entities/notification/repository";

/** Mark one notification read (scoped to the current user). */
export async function markNotificationReadAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  await notificationRepository(db).markRead(id, user.id);
  revalidatePath("/notifications");
}

/** Mark all of the current user's notifications read. */
export async function markAllNotificationsReadAction(): Promise<void> {
  const user = await requireUser();
  await notificationRepository(db).markAllRead(user.id);
  revalidatePath("/notifications");
}
