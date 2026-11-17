import "server-only";

import { tryCreateSupabaseServerClient } from "@/lib/supabase/server";
import type { Voucher, VoucherRedemption } from "@/types/domain";

export async function getAvailableVouchers(): Promise<Voucher[]> {
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return [];
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("vouchers")
    .select("*")
    .eq("is_active", true)
    .lte("starts_at", now)
    .or(`expires_at.is.null,expires_at.gte.${now}`)
    .order("min_purchase", { ascending: true });
  if (error || !data) return [];
  return (data as Voucher[]).filter(
    (voucher) => voucher.usage_limit == null || voucher.used_count < voucher.usage_limit,
  );
}

export async function getVoucherByCode(code: string): Promise<Voucher | null> {
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("vouchers")
    .select("*")
    .eq("code", code.trim().toUpperCase())
    .maybeSingle();
  if (error || !data) return null;
  return data as Voucher;
}

export async function getVoucherRedemptions(
  userId: string,
): Promise<VoucherRedemption[]> {
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("voucher_redemptions")
    .select("*, voucher:vouchers(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data as VoucherRedemption[];
}

export async function getAllVouchers(): Promise<Voucher[]> {
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("vouchers")
    .select("*")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data as Voucher[];
}
