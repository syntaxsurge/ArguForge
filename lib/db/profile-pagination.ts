import { asc, desc, sql } from "drizzle-orm";

import { db } from "./index";
import { profiles, type Profile } from "./schema";

/**
 * Fetch paginated, searchable, and sortable user profiles.
 * @returns paginated records plus total count for UI pagination.
 */
export async function getProfilesPaginated({
  page,
  pageSize,
  search,
  sortField = "updatedAt",
  sortDirection = "desc",
}: {
  page: number;
  pageSize: number;
  search?: string;
  sortField?: "username" | "email" | "credits" | "updatedAt";
  sortDirection?: "asc" | "desc";
}): Promise<{ profiles: Profile[]; total: number }> {
  // Sanitize pagination inputs
  const safePage = Number.isFinite(page) && page > 0 ? page : 1;
  const safePageSize =
    Number.isFinite(pageSize) && pageSize > 0 && pageSize <= 100
      ? pageSize
      : 20;
  const offset = (safePage - 1) * safePageSize;

  // Build WHERE clause for search
  const whereClause = search
    ? sql`(lower(${profiles.username}) LIKE ${"%" + search.toLowerCase() + "%"} OR lower(${profiles.email}) LIKE ${"%" + search.toLowerCase() + "%"})`
    : sql`true`;

  // Validate sort field
  const column =
    sortField === "username"
      ? profiles.username
      : sortField === "email"
        ? profiles.email
        : sortField === "credits"
          ? profiles.credits
          : profiles.updatedAt;

  // Fetch paginated rows
  const rows = await db
    .select()
    .from(profiles)
    .where(whereClause)
    .orderBy(sortDirection === "asc" ? asc(column) : desc(column))
    .limit(safePageSize)
    .offset(offset);

  // Get total count
  const [{ count }] = await db
    .select({ count: sql`count(*)` })
    .from(profiles)
    .where(whereClause);

  return { profiles: rows, total: Number(count) };
}
