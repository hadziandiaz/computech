"use server";

import { revalidatePath } from "next/cache";

import { actionUser, fail, ok } from "@/lib/actions/helpers";
import type { ActionResult } from "@/lib/actions/types";
import { tryCreateSupabaseServerClient } from "@/lib/supabase/server";

export async function markNotificationReadAction(
  notificationId: string,
): Promise<ActionResult> {
  const user = await actionUser();
  if (!user) return fail("Sign in to manage notifications.", "auth");
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return fail("Supabase is not configured.", "not_configured");
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId)
    .eq("user_id", user.id);
  if (error) return fail(error.message);
  revalidatePath("/account/notifications");
  revalidatePath("/account", "layout");
  return ok("Notification marked as read.");
}

export async function markAllNotificationsReadAction(): Promise<ActionResult> {
  const user = await actionUser();
  if (!user) return fail("Sign in to manage notifications.", "auth");
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return fail("Supabase is not configured.", "not_configured");
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", user.id)
    .eq("is_read", false);
  if (error) return fail(error.message);
  revalidatePath("/account/notifications");
  revalidatePath("/account", "layout");
  return ok("All notifications marked as read.");
}

export async function deleteNotificationAction(
  notificationId: string,
): Promise<ActionResult> {
  const user = await actionUser();
  if (!user) return fail("Sign in to manage notifications.", "auth");
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return fail("Supabase is not configured.", "not_configured");
  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", notificationId)
    .eq("user_id", user.id);
  if (error) return fail(error.message);
  revalidatePath("/account/notifications");
  revalidatePath("/account", "layout");
  return ok("Notification removed.");
}
