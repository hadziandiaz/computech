import "server-only";

import { tryCreateSupabaseServerClient } from "@/lib/supabase/server";
import { productUnitPrice } from "@/lib/pricing";
import type { DiscountType, Product, Promotion } from "@/types/domain";

export interface PromotionWithProducts extends Promotion {
  product_ids: string[];
  overrides: Record<
    string,
    { discount_type: DiscountType | null; discount_value: number | null }
  >;
}

function mapPromotion(row: any): PromotionWithProducts {
  const links = (row.promotion_products ?? []) as Array<{
    product_id: string;
    discount_type: DiscountType | null;
    discount_value: number | null;
  }>;
  const overrides: PromotionWithProducts["overrides"] = {};
  for (const link of links) {
    overrides[link.product_id] = {
      discount_type: link.discount_type ?? null,
      discount_value: link.discount_value ?? null,
    };
  }
  return {
    ...(row as Promotion),
    product_ids: links.map((link) => link.product_id),
    overrides,
  };
}

export async function getActivePromotions(): Promise<PromotionWithProducts[]> {
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return [];
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("promotions")
    .select("*, promotion_products(product_id, discount_type, discount_value)")
    .eq("is_active", true)
    .lte("start_date", now)
    .gte("end_date", now)
    .order("discount_value", { ascending: false });

  if (error || !data) return [];
  return data
    .filter((row: any) => row.usage_limit == null || row.used_count < row.usage_limit)
    .map(mapPromotion);
}

export async function getAllPromotions(): Promise<PromotionWithProducts[]> {
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("promotions")
    .select("*, promotion_products(product_id, discount_type, discount_value)")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map(mapPromotion);
}

export async function getPromotionBySlug(
  slug: string,
): Promise<PromotionWithProducts | null> {
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("promotions")
    .select("*, promotion_products(product_id, discount_type, discount_value)")
    .eq("slug", slug)
    .maybeSingle();
  if (error || !data) return null;
  return mapPromotion(data);
}

export function promotionPrice(
  basePrice: number,
  promotion: Pick<Promotion, "discount_type" | "discount_value" | "max_discount">,
  override?: { discount_type: DiscountType | null; discount_value: number | null },
) {
  const discountType = override?.discount_type ?? promotion.discount_type;
  const discountValue = override?.discount_value ?? promotion.discount_value;
  let value =
    discountType === "percentage"
      ? Math.round(basePrice * (1 - discountValue / 100))
      : basePrice - discountValue;
  if (promotion.max_discount != null) {
    value = Math.max(value, basePrice - promotion.max_discount);
  }
  return Math.max(0, Math.min(basePrice, value));
}

/**
 * Applies the best active campaign price to each product. The database
 * function effective_price() is authoritative for orders; this mirrors the
 * same rule so catalog, cart and checkout previews agree.
 */
export function applyPromotions(
  products: Product[],
  promotions: PromotionWithProducts[],
): Product[] {
  if (!promotions.length) return products;
  return products.map((product) => {
    let bestPrice = productUnitPrice(product);
    let bestPromotion: PromotionWithProducts | null = null;

    for (const promotion of promotions) {
      if (!promotion.product_ids.includes(product.id)) continue;
      const price = promotionPrice(
        product.price,
        promotion,
        promotion.overrides[product.id],
      );
      if (price < bestPrice) {
        bestPrice = price;
        bestPromotion = promotion;
      }
    }

    if (!bestPromotion) {
      return { ...product, effective_price: bestPrice, promotion: null };
    }

    return {
      ...product,
      effective_price: bestPrice,
      promotion: {
        id: bestPromotion.id,
        name: bestPromotion.name,
        slug: bestPromotion.slug,
        type: bestPromotion.type,
      },
    };
  });
}
