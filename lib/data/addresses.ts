import "server-only";

import { tryCreateSupabaseServerClient } from "@/lib/supabase/server";
import type { Address } from "@/types/domain";

export async function getAddresses(userId: string): Promise<Address[]> {
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", userId)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data as Address[];
}

export async function getDefaultAddress(userId: string): Promise<Address | null> {
  const addresses = await getAddresses(userId);
  return addresses.find((address) => address.is_default) ?? addresses[0] ?? null;
}

export async function getAddressById(
  userId: string,
  id: string,
): Promise<Address | null> {
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", userId)
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return data as Address;
}
