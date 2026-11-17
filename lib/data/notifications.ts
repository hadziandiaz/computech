import "server-only";

import { tryCreateSupabaseServerClient } from "@/lib/supabase/server";
import type { Notification } from "@/types/domain";

export async function getNotifications(
  userId: string,
  limit = 50,
): Promise<Notification[]> {
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return data as Notification[];
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return 0;
  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);
  if (error) return 0;
  return count ?? 0;
}
