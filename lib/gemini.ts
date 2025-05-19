import { GoogleGenerativeAI, Schema, SchemaType } from "@google/generative-ai";

import { DebateAnalysis } from "@/types/database.types";

import { prompts, formatPrompt } from "./prompts";

/* ------------------------------------------------------------------ *
 *  Gemini setup & JSON schema                                         *
 * ------------------------------------------------------------------ */

const genAI =
  process.env.GOOGLE_AI_KEY && process.env.GOOGLE_AI_KEY.trim() !== ""
    ? new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY!)
    : null;

const analysisSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    argument_analysis: {
      type: SchemaType.OBJECT,
      properties: {
        main_arguments: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
        },
        reasoning_quality: { type: SchemaType.STRING },
        evidence_usage: { type: SchemaType.STRING },
        logical_fallacies: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
        },
      },
      required: [
        "main_arguments",
        "reasoning_quality",
        "evidence_usage",
        "logical_fallacies",
      ],
    },
    rhetorical_analysis: {
      type: SchemaType.OBJECT,
      properties: {
        persuasiveness_score: { type: SchemaType.NUMBER },
        clarity_score: { type: SchemaType.NUMBER },
        language_effectiveness: { type: SchemaType.STRING },
        notable_phrases: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
        },
      },
      required: [
        "persuasiveness_score",
        "clarity_score",
        "language_effectiveness",
        "notable_phrases",
      ],
    },
    strategy_analysis: {
      type: SchemaType.OBJECT,
      properties: {
        opening_effectiveness: { type: SchemaType.STRING },
        counterargument_handling: { type: SchemaType.STRING },
        time_management: { type: SchemaType.STRING },
        overall_strategy: { type: SchemaType.STRING },
      },
      required: [
        "opening_effectiveness",
        "counterargument_handling",
        "time_management",
        "overall_strategy",
      ],
    },
    improvement_areas: {
      type: SchemaType.OBJECT,
      properties: {
        priority_improvements: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
        },
        practice_suggestions: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
        },
        specific_examples: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
        },
      },
      required: [
        "priority_improvements",
        "practice_suggestions",
        "specific_examples",
      ],
    },
    overall_assessment: {
      type: SchemaType.OBJECT,
      properties: {
        key_strengths: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
        },
        learning_points: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
        },
        effectiveness_score: { type: SchemaType.NUMBER },
        summary: { type: SchemaType.STRING },
      },
      required: [
        "key_strengths",
        "learning_points",
        "effectiveness_score",
        "summary",
      ],
    },
  },
  required: [
    "argument_analysis",
    "rhetorical_analysis",
    "strategy_analysis",
    "improvement_areas",
    "overall_assessment",
  ],
};

/* ------------------------------------------------------------------ *
 *  Helpers                                                            *
 * ------------------------------------------------------------------ */

/**
 * Remove Markdown code-fence wrappers (``` or ```json).
 */
function stripCodeFences(raw: string): string {
  let text = raw.trim();
  if (!text.startsWith("```")) return text;

  // Drop opening fence line
  const firstNewline = text.indexOf("\n");
  if (firstNewline === -1) return text;

  text = text.slice(firstNewline + 1);

  // Drop trailing fence
  const lastFence = text.lastIndexOf("```");
  if (lastFence !== -1) {
    text = text.slice(0, lastFence);
  }
  return text.trim();
}

/**
 * Fallback: generate debate analysis using OpenAI Chat Completions.
 */
async function generateDebateAnalysisOpenAI(
  topic: string,
  stance: string,
  duration: number,
  transcript: Array<{ role: string; text: string; id: string }>,
): Promise<DebateAnalysis> {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  const prompt = formatPrompt(prompts.debateAnalysis, {
    topic,
    stance,
    duration: Math.floor(duration / 60).toString(),
    transcript: transcript.map((m) => `${m.role}: ${m.text}`).join("\n"),
  });

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "You are an expert debate coach. Analyse the debate and answer strictly in the JSON format described in the prompt.",
        },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content ?? "";
  const cleaned = stripCodeFences(raw);

  try {
    return JSON.parse(cleaned) as DebateAnalysis;
  } catch (e) {
    console.error("Failed to parse OpenAI analysis JSON:", e, cleaned);
    throw new Error("Failed to parse debate analysis JSON");
  }
}

/* ------------------------------------------------------------------ *
 *  Public API                                                         *
 * ------------------------------------------------------------------ */

/**
 * Generate structured debate analysis using Gemini by default,
 * falling back to OpenAI when USE_GEMINI is \"false\" or Gemini is unavailable.
 */
export async function generateDebateAnalysis(
  topic: string,
  stance: string,
  duration: number,
  transcript: Array<{ role: string; text: string; id: string }>,
): Promise<DebateAnalysis> {
  // Decide engine
  const useGemini =
    process.env.USE_GEMINI?.toLowerCase() !== "false" && genAI !== null;

  try {
    if (useGemini) {
      const model = genAI!.getGenerativeModel({
        model: "gemini-2.0-flash-001",
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: analysisSchema,
        },
      });

      const prompt = formatPrompt(prompts.debateAnalysis, {
        topic,
        stance,
        duration: Math.floor(duration / 60).toString(),
        transcript: transcript
          .map((msg) => `${msg.role}: ${msg.text}`)
          .join("\n"),
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const rawText = await response.text();
      const cleaned = stripCodeFences(rawText);

      try {
        return JSON.parse(cleaned) as DebateAnalysis;
      } catch (parseError) {
        console.error(
          "Failed to parse Gemini analysis JSON:",
          parseError,
          cleaned,
        );
        throw new Error("Failed to parse debate analysis JSON");
      }
    }

    // Fallback to OpenAI
    return await generateDebateAnalysisOpenAI(
      topic,
      stance,
      duration,
      transcript,
    );
  } catch (error) {
    console.error("Error generating analysis:", error);
    throw new Error("Failed to generate debate analysis");
  }
}
