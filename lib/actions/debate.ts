"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { eq } from "drizzle-orm";

import { Conversation } from "@/lib/conversations";
import { db } from "@/lib/db";
import { createDebate, updateDebate, getDebateById } from "@/lib/db/queries";
import { debates } from "@/lib/db/schema";
import type { NewDebate } from "@/lib/db/schema";
import { getCredits, decreaseCredits } from "@/lib/db/services/profile";
import { generateDebateAnalysis } from "@/lib/gemini";
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
 * Generate analysis JSON via Gemini and persist it.
 */
export async function generateDebateSummary(debateId: string): Promise<void> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("User not authenticated");

  const debate = await getDebateById(debateId);
  if (!debate) throw new Error("Debate not found");

  const analysis = await generateDebateAnalysis(
    debate.topic,
    debate.stance,
    debate.duration,
    debate.transcript as Array<{ role: string; text: string; id: string }>,
  );

  await updateDebate(debateId, { analysis });
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
