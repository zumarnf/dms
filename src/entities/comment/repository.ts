import { and, asc, eq, isNull } from "drizzle-orm";
import type { Db } from "@/shared/lib/db-types";
import { users } from "@/entities/user/schema";
import { comments, type Comment } from "./schema";

export type CommentWithAuthor = {
  id: string;
  body: string;
  createdAt: Date;
  authorName: string;
};

/** Document discussion data access. Bodies are plain text (rendered escaped). */
export function commentRepository(db: Db) {
  return {
    async add(input: { documentId: string; authorId: string; body: string }): Promise<Comment> {
      const [row] = await db.insert(comments).values(input).returning();
      return row!;
    },

    async listByDocument(documentId: string): Promise<Comment[]> {
      return db
        .select()
        .from(comments)
        .where(and(eq(comments.documentId, documentId), isNull(comments.deletedAt)))
        .orderBy(asc(comments.createdAt));
    },

    async listWithAuthor(documentId: string): Promise<CommentWithAuthor[]> {
      return db
        .select({
          id: comments.id,
          body: comments.body,
          createdAt: comments.createdAt,
          authorName: users.name,
        })
        .from(comments)
        .innerJoin(users, eq(comments.authorId, users.id))
        .where(and(eq(comments.documentId, documentId), isNull(comments.deletedAt)))
        .orderBy(asc(comments.createdAt));
    },

    async softDelete(id: string): Promise<void> {
      await db.update(comments).set({ deletedAt: new Date() }).where(eq(comments.id, id));
    },
  };
}
