// lib/db/services/profile.ts
"use server";

import { cache } from "react";

import { eq, sql } from "drizzle-orm";

import { db } from "../index";
import { profiles } from "../schema";
import type { Profile } from "../schema";

/* ------------------------------------------------------------------ *
 *  Public helpers
 * ------------------------------------------------------------------ */

/**
 * Fetch a user profile by ID (cached)
 */
export const getProfile = cache(
  async (userId: string): Promise<Profile | undefined> => {
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, userId));

    return profile;
  },
);

/**
 * Insert or update a user profile
 */
export async function upsertProfile(profile: {
  id: string;
  email?: string | null;
  username?: string | null;
  fullName?: string | null;
  avatarUrl?: string | null;
}): Promise<void> {
  await db
    .insert(profiles)
    .values({
      id: profile.id,
      email: profile.email || null,
      username: profile.username || null,
      fullName: profile.fullName || null,
      avatarUrl: profile.avatarUrl || null,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: profiles.id,
      set: {
        email: profile.email || null,
        username: profile.username || null,
        fullName: profile.fullName || null,
        avatarUrl: profile.avatarUrl || null,
        updatedAt: new Date(),
      },
    });
}

/**
 * Retrieve remaining credits for a user
 */
export const getCredits = cache(async (userId: string): Promise<number> => {
  const [user] = await db
    .select({ credits: profiles.credits })
    .from(profiles)
    .where(eq(profiles.id, userId));

  return user?.credits ?? 0;
});

/**
 * Decrease a user's credits by 1
 */
export async function decreaseCredits(userId: string): Promise<void> {
  await db
    .update(profiles)
    .set({
      credits: sql`${profiles.credits} - 1`,
      updatedAt: new Date(),
    })
    .where(eq(profiles.id, userId));
}

/**
 * Set a user's credits to an explicit value (admin only)
 */
export async function setCredits(
  userId: string,
  credits: number,
): Promise<void> {
  await db
    .update(profiles)
    .set({
      credits,
      updatedAt: new Date(),
    })
    .where(eq(profiles.id, userId));
}
