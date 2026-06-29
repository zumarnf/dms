import { and, desc, eq } from "drizzle-orm";
import type { Db } from "@/shared/lib/db-types";
import { toOffsetLimit, type Pagination } from "@/shared/types";
import { auditLogs, type AuditLog } from "./schema";

export type AuditEntry = {
  actorId?: string;
  action: string;
  targetType?: string;
  targetId?: string;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
};

export type AuditFilter = {
  actorId?: string;
  action?: string;
  targetType?: string;
};

/** Append-only audit trail. Never store secrets/PII in `metadata` (security.md). */
export function auditRepository(db: Db) {
  return {
    async log(entry: AuditEntry): Promise<void> {
      await db.insert(auditLogs).values(entry);
    },

    async list(filter: AuditFilter, pagination: Pagination): Promise<AuditLog[]> {
      const { offset, limit } = toOffsetLimit(pagination);
      const clauses = [
        filter.actorId ? eq(auditLogs.actorId, filter.actorId) : undefined,
        filter.action ? eq(auditLogs.action, filter.action) : undefined,
        filter.targetType ? eq(auditLogs.targetType, filter.targetType) : undefined,
      ].filter(Boolean);

      return db
        .select()
        .from(auditLogs)
        .where(clauses.length ? and(...clauses) : undefined)
        .orderBy(desc(auditLogs.createdAt))
        .offset(offset)
        .limit(limit);
    },
  };
}
