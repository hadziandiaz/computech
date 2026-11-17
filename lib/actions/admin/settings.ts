"use server";

import { revalidatePath } from "next/cache";

import { actionAdmin, fail, numberValue, ok, text } from "@/lib/actions/helpers";
import type { ActionResult } from "@/lib/actions/types";
import { tryCreateSupabaseServerClient } from "@/lib/supabase/server";

const SETTING_KEYS = [
  "store_name",
  "store_email",
  "store_whatsapp",
  "store_address",
  "store_hours",
  "store_tagline",
  "announcement_text",
  "announcement_link",
  "free_shipping_min",
  "bank_transfer_instructions",
] as const;

export async function saveSiteSettingsAction(
  formData: FormData,
): Promise<ActionResult> {
  const admin = await actionAdmin();
  if (!admin) return fail("Administrator access is required.", "forbidden");

  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return fail("Supabase is not configured.", "not_configured");

  const rows = SETTING_KEYS.map((key) => ({
    key,
    value:
      key === "free_shipping_min"
        ? String(Math.max(0, numberValue(formData, key)))
        : text(formData, key).slice(0, 2000),
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from("site_settings")
    .upsert(rows, { onConflict: "key" });
  if (error) return fail(error.message);

  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
  return ok("Store settings saved.");
}
