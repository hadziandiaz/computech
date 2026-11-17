import { NextResponse, type NextRequest } from "next/server";

import { sanitizeNextPath } from "@/lib/auth";
import { tryCreateSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = sanitizeNextPath(url.searchParams.get("next"), "/account");

  if (code) {
    const supabase = await tryCreateSupabaseServerClient();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(new URL(next, url.origin));
      }
    }
  }

  const login = new URL("/login", url.origin);
  login.searchParams.set("error", "The confirmation link is invalid or has expired. Please try again.");
  return NextResponse.redirect(login);
}
