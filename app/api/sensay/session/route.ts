import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getSensayCredentials } from "@/lib/db/services/profile";
import { createServerClient } from "@/lib/supabase";
import { SENSAY_API_VERSION } from "@/lib/config/sensay";

/* ------------------------------------------------------------------ *
 *  Validation schema                                                 *
 * ------------------------------------------------------------------ */
const BodySchema = z.object({
  replicaUUID: z.string().uuid(),
  messages: z.any(), // Flexible to accommodate both array & object bodies
  stream: z.boolean().optional().default(false),
});

/* ------------------------------------------------------------------ *
 *  Helpers                                                           *
 * ------------------------------------------------------------------ */
async function assertAuthenticatedUser() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

/* ------------------------------------------------------------------ *
 *  Route handler                                                     *
 * ------------------------------------------------------------------ */
export async function POST(req: NextRequest) {
  try {
    const user = await assertAuthenticatedUser();

    let body: z.infer<typeof BodySchema>;
    try {
      body = BodySchema.parse(await req.json());
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid request body" },
        { status: 400 },
      );
    }

    const creds = await getSensayCredentials(user.id);
    if (!creds) {
      return NextResponse.json(
        { success: false, error: "Sensay credentials not found" },
        { status: 401 },
      );
    }

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "X-ORGANIZATION-SECRET": creds.apiKey,
      "X-API-Version": SENSAY_API_VERSION,
      Accept: body.stream ? "text/event-stream" : "application/json",
    };

    const sensayRes = await fetch(
      `https://api.sensay.io/v1/replicas/${body.replicaUUID}/chat/completions`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(body.messages),
      },
    );

    if (body.stream) {
      // Pass through the SSE stream unchanged
      return new NextResponse(sensayRes.body, {
        status: sensayRes.status,
        headers: {
          "Content-Type": "text/event-stream",
        },
      });
    }

    // Non-stream JSON passthrough
    const data = await sensayRes.json();
    return NextResponse.json(data, { status: sensayRes.status });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}