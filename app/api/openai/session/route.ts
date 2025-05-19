import { NextResponse } from "next/server";

import { formatPrompt, prompts } from "@/lib/prompts";
import { logError } from "@/lib/utils/logger";

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error(`OPENAI_API_KEY is not set`);
    }

    const { debateInfo } = await request.json();

    const username = debateInfo?.username || "User";
    const topic = debateInfo?.topic || "General Debate Topic";
    const userStance = debateInfo?.stance || "FOR";
    const aiStance = userStance === "FOR" ? "AGAINST" : "FOR";

    const response = await fetch(
      "https://api.openai.com/v1/realtime/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-realtime-preview-2024-12-17",
          voice: "alloy",
          modalities: ["audio", "text"],
          instructions: formatPrompt(prompts.systemPrompt, {
            username,
            topic,
            userStance,
            aiStance,
          }),
          tool_choice: "auto",
        }),
      },
    );

    if (!response.ok) {
      throw new Error(
        `API request failed with status ${JSON.stringify(response)}`,
      );
    }

    const data = await response.json();

    // Return the JSON response to the client
    return NextResponse.json(data);
  } catch (error) {
    logError("Error fetching session data:", error);
    return NextResponse.json(
      { error: "Failed to fetch session data" },
      { status: 500 },
    );
  }
}
