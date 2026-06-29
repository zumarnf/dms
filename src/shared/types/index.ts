import { z } from "zod";

/** Reusable primitives shared by features (single source of truth for FE + BE). */
export const idSchema = z.string().uuid("ID tidak valid");

export const sortOrderSchema = z.enum(["asc", "desc"]).default("desc");

/** Pagination with a hard cap to blunt resource-exhaustion (security.md). */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
export type Pagination = z.infer<typeof paginationSchema>;

export const searchQuerySchema = z.string().trim().max(200).optional();

/** Offset/limit derived from pagination for repositories. */
export function toOffsetLimit(p: Pagination): { offset: number; limit: number } {
  return { offset: (p.page - 1) * p.pageSize, limit: p.pageSize };
}
