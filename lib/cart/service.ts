import "server-only";

import { clearGuestCart, guestCartCount, readGuestCart } from "@/lib/cart/guest";
import { PRODUCT_CARD_SELECT, mapProduct } from "@/lib/data/mappers";
import { applyPromotions, getActivePromotions } from "@/lib/data/promotions";
import { getProductsByIds } from "@/lib/data/products";
import { tryCreateSupabaseServerClient } from "@/lib/supabase/server";
import type { CartLine, CartSummary, Product } from "@/types/domain";

import type { SupabaseClient } from "@supabase/supabase-js";

export async function ensureCart(
  supabase: SupabaseClient,
  userId: string,
): Promise<string | null> {
  const { data: existing } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  if (existing?.id) return existing.id;

  const { data, error } = await supabase
    .from("carts")
    .insert({ user_id: userId })
    .select("id")
    .maybeSingle();
  if (error || !data?.id) return null;
  return data.id;
}

function lineFromProduct(product: Product, quantity: number): CartLine {
  const unitPrice = product.effective_price ?? product.price;
  return {
    product,
    quantity,
    unit_price: unitPrice,
    line_total: unitPrice * quantity,
    stock: product.inventory?.stock ?? 0,
  };
}

export function summariseLines(lines: CartLine[]): CartSummary {
  return {
    lines,
    item_count: lines.reduce((sum, line) => sum + line.quantity, 0),
    subtotal: lines.reduce((sum, line) => sum + line.line_total, 0),
    savings: lines.reduce(
      (sum, line) => sum + (line.product.price - line.unit_price) * line.quantity,
      0,
    ),
  };
}

async function getAuthenticatedLines(
  supabase: SupabaseClient,
  userId: string,
): Promise<CartLine[]> {
  const cartId = await ensureCart(supabase, userId);
  if (!cartId) return [];

  const { data, error } = await supabase
    .from("cart_items")
    .select(`quantity, product:products(${PRODUCT_CARD_SELECT})`)
    .eq("cart_id", cartId)
    .order("created_at", { ascending: true });
  if (error || !data) return [];

  const promotions = await getActivePromotions();
  const products = (data as any[]).map((row) =>
    mapProduct(
      Array.isArray(row.product) ? row.product[0] : row.product,
    ),
  );
  const decorated = applyPromotions(products, promotions);

  return (data as any[])
    .map((row, index) => {
      const product = decorated[index];
      if (!product) return null;
      return lineFromProduct(product, row.quantity);
    })
    .filter((line): line is CartLine => Boolean(line));
}

export async function getCartSummary(userId: string | null): Promise<CartSummary> {
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return summariseLines([]);

  if (userId) {
    return summariseLines(await getAuthenticatedLines(supabase, userId));
  }

  const guest = await readGuestCart();
  if (!guest.length) return summariseLines([]);
  const products = await getProductsByIds(guest.map((item) => item.product_id));
  const byId = new Map(products.map((product) => [product.id, product]));
  const lines = guest
    .map((item) => {
      const product = byId.get(item.product_id);
      return product ? lineFromProduct(product, item.quantity) : null;
    })
    .filter((line): line is CartLine => Boolean(line));
  return summariseLines(lines);
}

export async function getCartCount(userId: string | null): Promise<number> {
  if (!userId) return guestCartCount();
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return 0;
  const cartId = await ensureCart(supabase, userId);
  if (!cartId) return 0;
  const { data, error } = await supabase
    .from("cart_items")
    .select("quantity")
    .eq("cart_id", cartId);
  if (error || !data) return 0;
  return data.reduce((sum: number, row: { quantity: number }) => sum + row.quantity, 0);
}

/**
 * Called after a successful sign-in to carry a guest cart into the user's
 * database cart. Quantities are merged and capped by live stock.
 */
export async function mergeGuestCartIntoDb(userId: string): Promise<void> {
  const guest = await readGuestCart();
  if (!guest.length) return;
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return;

  const cartId = await ensureCart(supabase, userId);
  if (!cartId) return;

  const { data: existing } = await supabase
    .from("cart_items")
    .select("product_id, quantity")
    .eq("cart_id", cartId);
  const existingByProduct = new Map(
    (existing ?? []).map((row: { product_id: string; quantity: number }) => [
      row.product_id,
      row.quantity,
    ]),
  );

  const { data: inventory } = await supabase
    .from("product_inventory")
    .select("product_id, stock")
    .in("product_id", guest.map((item) => item.product_id));
  const stockByProduct = new Map(
    (inventory ?? []).map((row: { product_id: string; stock: number }) => [
      row.product_id,
      row.stock,
    ]),
  );

  for (const item of guest) {
    const stock = stockByProduct.get(item.product_id) ?? 0;
    if (stock <= 0) continue;
    const quantity = Math.min(
      99,
      stock,
      (existingByProduct.get(item.product_id) ?? 0) + item.quantity,
    );
    await supabase
      .from("cart_items")
      .upsert(
        { cart_id: cartId, product_id: item.product_id, quantity },
        { onConflict: "cart_id,product_id" },
      );
  }

  await clearGuestCart();
}
