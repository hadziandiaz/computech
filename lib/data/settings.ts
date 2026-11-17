import "server-only";

import { tryCreateSupabaseServerClient } from "@/lib/supabase/server";
import type { SiteSettings } from "@/types/domain";

export const defaultSiteSettings: SiteSettings = {
  store_name: "COMPUTECH",
  store_email: process.env.NEXT_PUBLIC_STORE_EMAIL ?? "",
  store_whatsapp: process.env.NEXT_PUBLIC_STORE_WHATSAPP ?? "",
  store_address: "",
  store_hours: "Monday to Saturday, 09:00–18:00 WIB",
  store_tagline: "Build Your Setup. Define Your Performance.",
  announcement_text: "",
  announcement_link: "",
  free_shipping_min: 500000,
  bank_transfer_instructions:
    "Transfer the exact order total and include your order number in the transfer description. Staff will verify the payment.",
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return defaultSiteSettings;

  const { data, error } = await supabase.from("site_settings").select("key, value");
  if (error || !data) return defaultSiteSettings;

  const map = new Map(data.map((row: { key: string; value: string }) => [row.key, row.value]));
  const read = (key: keyof SiteSettings, fallback: string) => {
    const value = map.get(key);
    return value != null && value !== "" ? value : fallback;
  };

  return {
    store_name: read("store_name", defaultSiteSettings.store_name),
    store_email: map.get("store_email") ?? defaultSiteSettings.store_email,
    store_whatsapp: map.get("store_whatsapp") ?? defaultSiteSettings.store_whatsapp,
    store_address: map.get("store_address") ?? defaultSiteSettings.store_address,
    store_hours: read("store_hours", defaultSiteSettings.store_hours),
    store_tagline: read("store_tagline", defaultSiteSettings.store_tagline),
    announcement_text: map.get("announcement_text") ?? "",
    announcement_link: map.get("announcement_link") ?? "",
    free_shipping_min: Number(map.get("free_shipping_min") ?? defaultSiteSettings.free_shipping_min) || 0,
    bank_transfer_instructions: read(
      "bank_transfer_instructions",
      defaultSiteSettings.bank_transfer_instructions,
    ),
  };
}
