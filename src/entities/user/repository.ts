import { desc, eq } from "drizzle-orm";
import type { Db } from "@/shared/lib/db-types";
import { toOffsetLimit, type Pagination } from "@/shared/types";
import type { Role } from "@/shared/config/permissions";
import { users, type User } from "./schema";

type UserStatus = "active" | "disabled";

/** User data access (lookup for sharing, plus admin management). */
export function userRepository(db: Db) {
  return {
    async findByEmail(email: string): Promise<User | undefined> {
      const [row] = await db.select().from(users).where(eq(users.email, email)).limit(1);
      return row;
    },

    async findById(id: string): Promise<User | undefined> {
      const [row] = await db.select().from(users).where(eq(users.id, id)).limit(1);
      return row;
    },

    async list(pagination: Pagination): Promise<User[]> {
      const { offset, limit } = toOffsetLimit(pagination);
      return db.select().from(users).orderBy(desc(users.createdAt)).offset(offset).limit(limit);
    },

    async setRole(id: string, role: Role): Promise<void> {
      await db.update(users).set({ role, updatedAt: new Date() }).where(eq(users.id, id));
    },

    async setStatus(id: string, status: UserStatus): Promise<void> {
      await db.update(users).set({ status, updatedAt: new Date() }).where(eq(users.id, id));
    },
  };
}
