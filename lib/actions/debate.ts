"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { eq } from "drizzle-orm";

import { Conversation } from "@/lib/conversations";
import { db } from "@/lib/db";
import { createDebate, updateDebate } from "@/lib/db/queries";
import { debates } from "@/lib/db/schema";
import type { NewDebate } from "@/lib/db/schema";
import { getCredits, decreaseCredits } from "@/lib/db/services/profile";
import { createServerClient } from "@/lib/supabase";

/**
 * Save a completed debate to the database.
 */
export async function saveDebate(debateData: {
  topic: string;
  stance: string;
  duration: number;
  inputTokens: number;
  outputTokens: number;
  transcript: Conversation[];
}): Promise<string> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("User not authenticated");

  const newDebate: NewDebate = {
    userId: user.id,
    topic: debateData.topic,
    stance: debateData.stance,
    duration: debateData.duration,
    inputTokens: debateData.inputTokens,
    outputTokens: debateData.outputTokens,
    transcript: debateData.transcript,
  };

  const debateId = await createDebate(newDebate);
  revalidatePath("/app");
  return debateId;
}

/**
 * Temporarily stubbed debate analysis; full implementation will follow Sensay integration.
 */
export async function generateDebateSummary(debateId: string): Promise<void> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("User not authenticated");

  // Update debate with empty analysis placeholder
  await updateDebate(debateId, { analysis: null });
  revalidatePath(`/app/debate/${debateId}`);
}

/**
 * Permanently remove a debate.
 */
export async function deleteDebate(debateId: string): Promise<void> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("User not authenticated");

  await db.delete(debates).where(eq(debates.id, debateId));
  revalidatePath("/app");
  redirect("/app");
}

/**
 * Return remaining practice credits for the authenticated user.
 */
export async function checkDebateCredits(): Promise<number> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("User not authenticated");
  return getCredits(user.id);
}

/**
 * Consume one practice credit.
 */
export async function useDebateCredit(): Promise<void> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("User not authenticated");
  await decreaseCredits(user.id);
}