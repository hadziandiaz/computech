"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { ok, fail, actionUser } from "@/lib/actions/helpers";
import type { ActionResult } from "@/lib/actions/types";
import { readGuestCart, writeGuestCart } from "@/lib/cart/guest";
import { ensureCart } from "@/lib/cart/service";
import { tryCreateSupabaseServerClient } from "@/lib/supabase/server";

const MAX_LINES = 20;
const MAX_GUEST_QUANTITY = 10;

function revalidateCart() {
  revalidatePath("/cart");
  revalidatePath("/checkout");
  revalidatePath("/", "layout");
}

async function productStock(productId: string) {
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return { error: "Supabase is not configured." as const };
  const { data, error } = await supabase
    .from("products")
    .select("id, name, status, inventory:product_inventory(stock)")
    .eq("id", productId)
    .maybeSingle();
  if (error || !data) return { error: "Product not found." as const };
  if (data.status !== "active") return { error: "This product is not available." as const };
  const inventory = Array.isArray(data.inventory) ? data.inventory[0] : data.inventory;
  const stock = inventory?.stock ?? 0;
  if (stock <= 0) return { error: "This product is out of stock." as const };
  return { stock, name: data.name as string };
}

export async function addToCartAction(
  productId: string,
  quantity = 1,
): Promise<ActionResult<{ count: number }>> {
  const parsed = z
    .object({
      productId: z.string().uuid("Invalid product."),
      quantity: z.number().int().min(1).max(99),
    })
    .safeParse({ productId, quantity });
  if (!parsed.success) return fail("Invalid cart request.");

  const user = await actionUser();
  const stock = await productStock(parsed.data.productId);
  if ("error" in stock && stock.error) return fail(stock.error);

  if (user) {
    const supabase = await tryCreateSupabaseServerClient();
    if (!supabase) return fail("Supabase is not configured.", "not_configured");
    const cartId = await ensureCart(supabase, user.id);
    if (!cartId) return fail("Could not open your cart.");

    const { data: existing } = await supabase
      .from("cart_items")
      .select("quantity")
      .eq("cart_id", cartId)
      .eq("product_id", parsed.data.productId)
      .maybeSingle();

    const nextQuantity = Math.min(
      99,
      stock.stock,
      (existing?.quantity ?? 0) + parsed.data.quantity,
    );
    const { error } = await supabase.from("cart_items").upsert(
      { cart_id: cartId, product_id: parsed.data.productId, quantity: nextQuantity },
      { onConflict: "cart_id,product_id" },
    );
    if (error) return fail(error.message);
    revalidateCart();
    return ok(`${stock.name} added to your cart.`, { count: nextQuantity });
  }

  const guest = await readGuestCart();
  const existing = guest.find((item) => item.product_id === parsed.data.productId);
  const existingQuantity = existing?.quantity ?? 0;
  const nextQuantity = Math.min(
    MAX_GUEST_QUANTITY,
    stock.stock,
    existingQuantity + parsed.data.quantity,
  );

  const next = existing
    ? guest.map((item) =>
        item.product_id === parsed.data.productId
          ? { ...item, quantity: nextQuantity }
          : item,
      )
    : [...guest, { product_id: parsed.data.productId, quantity: nextQuantity }].slice(
        0,
        MAX_LINES,
      );

  await writeGuestCart(next);
  revalidateCart();
  return ok(
    `${stock.name} added to your cart. Sign in to keep it across devices.`,
    { count: nextQuantity },
  );
}

export async function updateCartQuantityAction(
  productId: string,
  quantity: number,
): Promise<ActionResult> {
  const user = await actionUser();
  const supabase = await tryCreateSupabaseServerClient();

  if (quantity <= 0) {
    return removeFromCartAction(productId);
  }

  if (user && supabase) {
    const stock = await productStock(productId);
    if ("error" in stock && stock.error) return fail(stock.error);
    const cartId = await ensureCart(supabase, user.id);
    if (!cartId) return fail("Your cart could not be found.");
    const next = Math.min(99, stock.stock, Math.max(1, Math.floor(quantity)));
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: next })
      .eq("cart_id", cartId)
      .eq("product_id", productId);
    if (error) return fail(error.message);
    revalidateCart();
    return ok("Cart updated.");
  }

  const guest = await readGuestCart();
  const next = guest.map((item) =>
    item.product_id === productId
      ? { ...item, quantity: Math.min(MAX_GUEST_QUANTITY, Math.max(1, Math.floor(quantity))) }
      : item,
  );
  await writeGuestCart(next);
  revalidateCart();
  return ok("Cart updated.");
}

export async function removeFromCartAction(productId: string): Promise<ActionResult> {
  const user = await actionUser();
  const supabase = await tryCreateSupabaseServerClient();

  if (user && supabase) {
    const cartId = await ensureCart(supabase, user.id);
    if (cartId) {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("cart_id", cartId)
        .eq("product_id", productId);
      if (error) return fail(error.message);
    }
    revalidateCart();
    return ok("Item removed from your cart.");
  }

  const guest = await readGuestCart();
  await writeGuestCart(guest.filter((item) => item.product_id !== productId));
  revalidateCart();
  return ok("Item removed from your cart.");
}

export async function clearCartAction(): Promise<ActionResult> {
  const user = await actionUser();
  const supabase = await tryCreateSupabaseServerClient();

  if (user && supabase) {
    const cartId = await ensureCart(supabase, user.id);
    if (cartId) {
      const { error } = await supabase.from("cart_items").delete().eq("cart_id", cartId);
      if (error) return fail(error.message);
    }
  } else {
    await writeGuestCart([]);
  }

  revalidateCart();
  return ok("Cart cleared.");
}
