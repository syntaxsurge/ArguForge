import { cache } from "react";

import { eq, desc, sql } from "drizzle-orm";

import { db } from "./index";
import { debates, profiles, type Debate, type Profile } from "./schema";

/* ------------------------------------------------------------------ *
 *  Debates
 * ------------------------------------------------------------------ */

/**
 * Get all debates for a user
 */
export const getUserDebates = cache(
  async (userId: string): Promise<Debate[]> => {
    return db
      .select()
      .from(debates)
      .where(eq(debates.userId, userId))
      .orderBy(desc(debates.createdAt));
  },
);

/**
 * Get a specific debate by ID
 */
export const getDebateById = cache(
  async (debateId: string): Promise<Debate | undefined> => {
    const [debate] = await db
      .select()
      .from(debates)
      .where(eq(debates.id, debateId));

    return debate;
  },
);

/**
 * Create a new debate record
 */
export async function createDebate(
  debate: import("./schema").NewDebate,
): Promise<string> {
  const [result] = await db
    .insert(debates)
    .values(debate)
    .returning({ id: debates.id });

  return result.id;
}

/**
 * Update an existing debate record
 */
export async function updateDebate(
  debateId: string,
  data: Partial<Omit<import("./schema").NewDebate, "id" | "userId">>,
): Promise<void> {
  await db.update(debates).set(data).where(eq(debates.id, debateId));
}

/**
 * Get the count of debates for a user
 */
export const getUserDebateCount = cache(
  async (userId: string): Promise<number> => {
    const result = await db
      .select({ count: sql`count(*)` })
      .from(debates)
      .where(eq(debates.userId, userId));

    return Number(result[0].count);
  },
);

/* ------------------------------------------------------------------ *
 *  Profiles / Admin
 * ------------------------------------------------------------------ */

/**
 * Retrieve all user profiles (admin use only) ordered by most recent activity.
 * Caching is intentionally disabled to ensure the admin panel always reflects
 * the latest data.
 */
export async function getAllProfiles(): Promise<Profile[]> {
  return db.select().from(profiles).orderBy(desc(profiles.updatedAt));
}
