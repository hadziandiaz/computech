import "server-only";

import { tryCreateSupabaseServerClient } from "@/lib/supabase/server";
import type { Brand } from "@/types/domain";

export async function getBrands(activeOnly = true): Promise<Brand[]> {
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return [];
  let query = supabase.from("brands").select("*").order("name");
  if (activeOnly) query = query.eq("is_active", true);
  const { data, error } = await query;
  if (error || !data) return [];
  return data as Brand[];
}

export async function getBrandBySlug(slug: string): Promise<Brand | null> {
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("brands")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  if (error || !data) return null;
  return data as Brand;
}
