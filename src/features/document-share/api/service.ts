import type { Db } from "@/shared/lib/db-types";
import { ValidationError } from "@/shared/lib/errors";
import type { Role } from "@/shared/config/permissions";
import type { ShareLevel } from "@/shared/config/permissions";
import { userRepository } from "@/entities/user/repository";
import { permissionRepository } from "@/entities/permission/repository";
import { notificationRepository } from "@/entities/notification/repository";

export type ShareInput = {
  documentId: string;
  title: string;
  ownerId: string;
  actorId: string;
  level: ShareLevel;
} & ({ granteeType: "user"; email: string } | { granteeType: "role"; role: Role });

/**
 * Grant access to a document. For user grants the email is resolved to an
 * account; the recipient gets an in-app notification. Owner self-share is
 * rejected (they already have full access).
 */
export async function shareDocument(db: Db, input: ShareInput): Promise<void> {
  const perms = permissionRepository(db);

  if (input.granteeType === "user") {
    const user = await userRepository(db).findByEmail(input.email.trim().toLowerCase());
    if (!user) throw new ValidationError("Pengguna dengan email itu tidak ditemukan");
    if (user.id === input.ownerId) {
      throw new ValidationError("Pemilik sudah memiliki akses penuh");
    }
    await perms.grant({
      resourceType: "document",
      resourceId: input.documentId,
      granteeType: "user",
      granteeId: user.id,
      level: input.level,
      grantedBy: input.actorId,
    });
    await notificationRepository(db).create({
      userId: user.id,
      type: "document.shared",
      payload: { documentId: input.documentId, title: input.title, level: input.level },
    });
    return;
  }

  await perms.grant({
    resourceType: "document",
    resourceId: input.documentId,
    granteeType: "role",
    granteeId: input.role,
    level: input.level,
    grantedBy: input.actorId,
  });
}
