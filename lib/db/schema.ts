import {
  pgTable,
  uuid,
  timestamp,
  text,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";

import { DebateAnalysis } from "@/types/database.types";

/**
 * User profiles table
 */
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
  username: text("username").unique(),
  fullName: text("full_name"),
  avatarUrl: text("avatar_url"),
  email: text("email"),
  credits: integer("credits").notNull().default(1),
});

/**
 * Debates table
 */
export const debates = pgTable("debates", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  userId: uuid("user_id")
    .notNull()
    .references(() => profiles.id),
  topic: text("topic").notNull(),
  stance: text("stance").notNull(),
  duration: integer("duration").notNull(),
  inputTokens: integer("input_tokens").notNull().default(0),
  outputTokens: integer("output_tokens").notNull().default(0),
  transcript: jsonb("transcript").notNull(),
  analysis: jsonb("analysis").$type<DebateAnalysis>(),
});

/**
 * Types for better TypeScript support
 */
export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;

export type Debate = typeof debates.$inferSelect;
export type NewDebate = typeof debates.$inferInsert;
