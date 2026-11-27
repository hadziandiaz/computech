import "server-only";

import { computeShippingQuotes } from "@/lib/shipping/quotes";
import { tryCreateSupabaseServerClient } from "@/lib/supabase/server";
import type {
  ShippingAddressSnapshot,
  ShippingMethod,
  ShippingQuote,
  ShippingZone,
  ShippingZoneRate,
} from "@/types/domain";

export async function getShippingMethods(
  activeOnly = true,
): Promise<ShippingMethod[]> {
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return [];
  let query = supabase
    .from("shipping_methods")
    .select("*")
    .order("sort_order", { ascending: true });
  if (activeOnly) query = query.eq("is_active", true);
  const { data, error } = await query;
  if (error || !data) return [];
  return data as ShippingMethod[];
}

export async function getShippingMethodById(
  id: string,
): Promise<ShippingMethod | null> {
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("shipping_methods")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return data as ShippingMethod;
}

export async function getShippingZones(
  activeOnly = true,
): Promise<ShippingZone[]> {
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return [];
  let query = supabase
    .from("shipping_zones")
    .select("*")
    .order("sort_order", { ascending: true });
  if (activeOnly) query = query.eq("is_active", true);
  const { data, error } = await query;
  if (error || !data) return [];
  return data.map((zone) => ({
    ...zone,
    matchers: Array.isArray(zone.matchers) ? zone.matchers : [],
  })) as ShippingZone[];
}

export async function getShippingZoneRates(): Promise<ShippingZoneRate[]> {
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from("shipping_zone_rates").select("*");
  if (error || !data) return [];
  return data as ShippingZoneRate[];
}

export { computeShippingQuotes } from "@/lib/shipping/quotes";

export async function quoteShipping(
  address: Pick<ShippingAddressSnapshot, "province" | "city" | "district">,
): Promise<ShippingQuote[]> {
  const supabase = await tryCreateSupabaseServerClient();
  if (supabase) {
    const { data, error } = await supabase.rpc("shipping_quotes", {
      p_address: {
        province: address.province ?? "",
        city: address.city ?? "",
        district: address.district ?? "",
      },
    });
    if (!error && Array.isArray(data) && data.length) {
      return data as ShippingQuote[];
    }
  }

  const [methods, zones, rates] = await Promise.all([
    getShippingMethods(true),
    getShippingZones(true),
    getShippingZoneRates(),
  ]);
  return computeShippingQuotes(methods, zones, rates, address);
}
