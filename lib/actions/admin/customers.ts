"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { actionAdmin, fail, ok } from "@/lib/actions/helpers";
import type { ActionResult } from "@/lib/actions/types";
import { tryCreateSupabaseServerClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/domain";

export async function setCustomerRoleAction(
  userId: string,
  role: UserRole,
): Promise<ActionResult> {
  const admin = await actionAdmin();
  if (!admin) return fail("Administrator access is required.", "forbidden");
  if (admin.id === userId) {
    return fail("You cannot change your own role. Ask another administrator.");
  }

  const parsed = z
    .object({
      userId: z.string().uuid(),
      role: z.enum(["admin", "staff", "customer"]),
    })
    .safeParse({ userId, role });
  if (!parsed.success) return fail("Invalid role request.");

  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return fail("Supabase is not configured.", "not_configured");

  const { error } = await supabase
    .from("user_roles")
    .upsert(
      { user_id: parsed.data.userId, role: parsed.data.role },
      { onConflict: "user_id" },
    );
  if (error) return fail(error.message);

  revalidatePath("/admin/customers");
  revalidatePath(`/admin/customers/${userId}`);
  return ok(`Role updated to ${parsed.data.role}.`);
}

export async function toggleCustomerSuspensionAction(
  userId: string,
  suspended: boolean,
): Promise<ActionResult> {
  const admin = await actionAdmin();
  if (!admin) return fail("Administrator access is required.", "forbidden");
  if (admin.id === userId) return fail("You cannot suspend your own account.");

  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return fail("Supabase is not configured.", "not_configured");

  const { error } = await supabase
    .from("profiles")
    .update({ is_suspended: suspended })
    .eq("id", userId);
  if (error) return fail(error.message);

  revalidatePath("/admin/customers");
  revalidatePath(`/admin/customers/${userId}`);
  return ok(suspended ? "Account suspended." : "Account restored.");
}
