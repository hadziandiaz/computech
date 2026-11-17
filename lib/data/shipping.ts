import "server-only";

import { tryCreateSupabaseServerClient } from "@/lib/supabase/server";
import type { ShippingMethod } from "@/types/domain";

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
