import { NextRequest, NextResponse } from "next/server";

import { upsertProfile } from "@/lib/db/services/profile";
import { createServerClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = await createServerClient();
    await supabase.auth.exchangeCodeForSession(code);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await upsertProfile({
        id: user.id,
        email: user.email,
        avatarUrl: user.user_metadata?.avatar_url,
        fullName: user.user_metadata?.full_name,
      });
    }
  }

  return NextResponse.redirect(new URL("/app", requestUrl.origin));
}
