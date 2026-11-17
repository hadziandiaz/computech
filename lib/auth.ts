import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";
import { tryCreateSupabaseServerClient } from "@/lib/supabase/server";
import type { AuthUser, Profile, UserRole } from "@/types/domain";

export const getAuthUser = cache(async (): Promise<AuthUser | null> => {
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return null;

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  const [{ data: profileRow }, { data: roleRow }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", user.id).maybeSingle(),
  ]);

  const role = (roleRow?.role as UserRole | undefined) ?? "customer";
  const profile = (profileRow as Profile | null) ?? null;

  return {
    id: user.id,
    email: user.email ?? profile?.email ?? "",
    profile,
    role,
  };
});

export function loginPath(nextPath = "/account") {
  return `/login?next=${encodeURIComponent(nextPath)}`;
}

export async function requireUser(nextPath = "/account"): Promise<AuthUser> {
  const user = await getAuthUser();
  if (!user) redirect(loginPath(nextPath));
  if (user.profile?.is_suspended) redirect("/suspended");
  return user;
}

export async function requireStaff(nextPath = "/admin"): Promise<AuthUser> {
  const user = await requireUser(nextPath);
  if (user.role !== "admin" && user.role !== "staff") redirect("/account");
  return user;
}

export async function requireAdmin(nextPath = "/admin"): Promise<AuthUser> {
  const user = await requireUser(nextPath);
  if (user.role !== "admin") redirect("/admin?denied=1");
  return user;
}

export function sanitizeNextPath(value: string | null | undefined, fallback = "/account") {
  if (!value) return fallback;
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}
