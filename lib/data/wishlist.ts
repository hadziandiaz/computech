import "server-only";

import { PRODUCT_CARD_SELECT, mapProduct } from "@/lib/data/mappers";
import { applyPromotions, getActivePromotions } from "@/lib/data/promotions";
import { tryCreateSupabaseServerClient } from "@/lib/supabase/server";
import type { Product } from "@/types/domain";

export async function ensureWishlist(
  supabase: Awaited<ReturnType<typeof tryCreateSupabaseServerClient>>,
  userId: string,
): Promise<string | null> {
  if (!supabase) return null;
  const { data: existing } = await supabase
    .from("wishlists")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  if (existing?.id) return existing.id;
  const { data, error } = await supabase
    .from("wishlists")
    .insert({ user_id: userId })
    .select("id")
    .maybeSingle();
  if (error || !data?.id) return null;
  return data.id;
}

export async function getWishlistProducts(userId: string): Promise<Product[]> {
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return [];
  const wishlistId = await ensureWishlist(supabase, userId);
  if (!wishlistId) return [];

  const { data, error } = await supabase
    .from("wishlist_items")
    .select(`created_at, product:products(${PRODUCT_CARD_SELECT})`)
    .eq("wishlist_id", wishlistId)
    .order("created_at", { ascending: false });
  if (error || !data) return [];

  const products = (data as any[]).map((row) =>
    mapProduct(Array.isArray(row.product) ? row.product[0] : row.product),
  );
  return applyPromotions(products, await getActivePromotions());
}

export async function getWishlistProductIds(userId: string): Promise<string[]> {
  const products = await getWishlistProducts(userId);
  return products.map((product) => product.id);
}

export async function isInWishlist(
  userId: string,
  productId: string,
): Promise<boolean> {
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return false;
  const wishlistId = await ensureWishlist(supabase, userId);
  if (!wishlistId) return false;
  const { data } = await supabase
    .from("wishlist_items")
    .select("id")
    .eq("wishlist_id", wishlistId)
    .eq("product_id", productId)
    .maybeSingle();
  return Boolean(data);
}
