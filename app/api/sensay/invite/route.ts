import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { redeemInvite } from "@/lib/sensay/client";
import { createServerClient } from "@/lib/supabase";

/* ------------------------------------------------------------------ *
 *  Helpers                                                            *
 * ------------------------------------------------------------------ */
async function assertAdmin(req: NextRequest) {
  const supabase = await createServerClient(req);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const adminEmails =
    process.env.ADMIN_EMAILS?.split(",").map((e) => e.trim().toLowerCase()) ??
    [];

  if (!user || !adminEmails.includes(user.email?.toLowerCase() ?? "")) {
    return null;
  }
  return user;
}

const BodySchema = z.object({
  code: z.string().min(5),
  organizationName: z.string().min(2),
  name: z.string().min(2),
  email: z.string().email(),
});

/* ------------------------------------------------------------------ *
 *  POST handler                                                       *
 * ------------------------------------------------------------------ */
export async function POST(req: NextRequest) {
  const admin = await assertAdmin(req);
  if (!admin) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await req.json());
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body" },
      { status: 400 },
    );
  }

  try {
    const sensayRes = await redeemInvite(body.code, {
      organizationName: body.organizationName,
      name: body.name,
      email: body.email,
    });

    return NextResponse.json(
      { success: true, data: sensayRes },
      { status: 200 },
    );
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : "Unknown Sensay API error";
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 },
    );
  }
}