import "server-only";

import { tryCreateSupabaseServerClient } from "@/lib/supabase/server";
import type { ProductReview } from "@/types/domain";

export async function getProductReviews(
  productId: string,
  limit = 30,
): Promise<ProductReview[]> {
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("product_reviews")
    .select("*, profile:profiles(full_name, avatar_url)")
    .eq("product_id", productId)
    .eq("is_approved", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return data as ProductReview[];
}

export async function getAllReviews(): Promise<ProductReview[]> {
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("product_reviews")
    .select("*, product:products(id, name, slug), profile:profiles(full_name, avatar_url)")
    .order("created_at", { ascending: false })
    .limit(300);
  if (error || !data) return [];
  return data as ProductReview[];
}

export async function getUserReviews(userId: string): Promise<ProductReview[]> {
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("product_reviews")
    .select("*, product:products(id, name, slug)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data as ProductReview[];
}

export interface ReviewableItem {
  order_id: string;
  order_item_id: string;
  product_id: string;
  product_name: string;
  product_slug: string | null;
  image_url: string | null;
  order_number: string;
  delivered_at: string | null;
  existing_review_id: string | null;
}

export async function getReviewableItems(userId: string): Promise<ReviewableItem[]> {
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("order_items")
    .select(
      "id, order_id, product_id, product_name, product_slug, image_url, order:orders!inner(order_number, status, user_id, updated_at), review:product_reviews(id, user_id)",
    )
    .not("product_id", "is", null)
    .eq("order.user_id", userId)
    .in("order.status", ["delivered", "completed"]);
  if (error || !data) return [];

  return (data as any[])
    .map((row) => {
      const order = Array.isArray(row.order) ? row.order[0] : row.order;
      const reviews = Array.isArray(row.review) ? row.review : row.review ? [row.review] : [];
      const mine = reviews.find((review: any) => review.user_id === userId);
      return {
        order_id: row.order_id,
        order_item_id: row.id,
        product_id: row.product_id,
        product_name: row.product_name,
        product_slug: row.product_slug,
        image_url: row.image_url,
        order_number: order?.order_number ?? "",
        delivered_at: order?.updated_at ?? null,
        existing_review_id: mine?.id ?? null,
      } satisfies ReviewableItem;
    })
    .filter((item) => !item.existing_review_id);
}
