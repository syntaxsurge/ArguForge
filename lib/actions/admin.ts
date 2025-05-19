"use server";

import { revalidatePath } from "next/cache";

import { getProfilesPaginated } from "@/lib/db/profile-pagination";
import { getAllProfiles } from "@/lib/db/queries";
import { setCredits, upsertProfile } from "@/lib/db/services/profile";
import { createServerClient } from "@/lib/supabase";

/* ------------------------------------------------------------------ *
 *  Admin guard & helpers                                             *
 * ------------------------------------------------------------------ */

/**
 * Ensure the current user is authorised as an admin.
 * Admin emails are configured via the comma-separated ENV var ADMIN_EMAILS.
 * Additionally, guarantee that the admin has a corresponding profile record
 * so they (and future admins) always appear in the user management table.
 */
async function assertAdmin(): Promise<void> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const adminEmails =
    process.env.ADMIN_EMAILS?.split(",").map((e) => e.trim().toLowerCase()) ??
    [];

  if (!user || !adminEmails.includes(user.email?.toLowerCase() ?? "")) {
    throw new Error("Unauthorized");
  }

  // Upsert the admin's profile to ensure visibility in the admin panel
  await upsertProfile({
    id: user.id,
    email: user.email,
    username:
      user.user_metadata?.username ??
      user.user_metadata?.name ??
      user.user_metadata?.full_name ??
      null,
    fullName: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
    avatarUrl: user.user_metadata?.avatar_url ?? null,
  });
}

/* ------------------------------------------------------------------ *
 *  Public admin-only actions                                         *
 * ------------------------------------------------------------------ */

/**
 * Legacy helper – returns **all** profiles (no pagination).
 */
export async function listUsers() {
  await assertAdmin();
  return getAllProfiles();
}

/**
 * Paginated, searchable, and sortable user list.
 */
export async function listUsersPaginated(opts: {
  page: number;
  pageSize: number;
  search?: string;
  sortField?: "username" | "email" | "credits" | "updatedAt";
  sortDirection?: "asc" | "desc";
}) {
  await assertAdmin();
  return getProfilesPaginated(opts);
}

/**
 * Update a user's credit balance.
 */
export async function updateUserCredits(
  userId: string,
  credits: number,
): Promise<void> {
  await assertAdmin();
  await setCredits(userId, credits);
  revalidatePath("/dashboard/admin/users");
}
