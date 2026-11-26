import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

import { sanitizeNextPath } from "@/lib/auth";
import { tryCreateSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const tokenHash = url.searchParams.get("token_hash");
  const rawType = url.searchParams.get("type") ?? "recovery";
  const type = rawType as EmailOtpType;
  const next = sanitizeNextPath(url.searchParams.get("next"), "/reset-password");

  if (tokenHash) {
    const supabase = await tryCreateSupabaseServerClient();
    if (supabase) {
      const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
      if (!error) {
        return NextResponse.redirect(new URL(next, url.origin));
      }
    }
  }

  const login = new URL("/login", url.origin);
  login.searchParams.set(
    "error",
    "The confirmation link is invalid or has expired. Please try again.",
  );
  return NextResponse.redirect(login);
}
