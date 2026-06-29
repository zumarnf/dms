import { and, desc, eq, isNull, sql } from "drizzle-orm";
import type { Db } from "@/shared/lib/db-types";
import { toOffsetLimit, type Pagination } from "@/shared/types";
import { notifications, type Notification } from "./schema";

/** In-app notification data access. */
export function notificationRepository(db: Db) {
  return {
    async create(input: {
      userId: string;
      type: string;
      payload?: Record<string, unknown>;
    }): Promise<void> {
      await db.insert(notifications).values(input);
    },

    async listForUser(userId: string, pagination: Pagination): Promise<Notification[]> {
      const { offset, limit } = toOffsetLimit(pagination);
      return db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, userId))
        .orderBy(desc(notifications.createdAt))
        .offset(offset)
        .limit(limit);
    },

    async countUnread(userId: string): Promise<number> {
      const [row] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(notifications)
        .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));
      return row?.count ?? 0;
    },

    async markRead(id: string, userId: string): Promise<void> {
      await db
        .update(notifications)
        .set({ readAt: new Date() })
        .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
    },

    async markAllRead(userId: string): Promise<void> {
      await db
        .update(notifications)
        .set({ readAt: new Date() })
        .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));
    },
  };
}
