"use server";

import { revalidatePath } from "next/cache";

import { actionUser, fail, ok } from "@/lib/actions/helpers";
import type { ActionResult } from "@/lib/actions/types";
import { ensureWishlist } from "@/lib/data/wishlist";
import { tryCreateSupabaseServerClient } from "@/lib/supabase/server";

export async function toggleWishlistAction(
  productId: string,
): Promise<ActionResult<{ added: boolean }>> {
  const user = await actionUser();
  if (!user) return fail("Sign in to save products to your wishlist.", "auth");

  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return fail("Supabase is not configured.", "not_configured");

  const wishlistId = await ensureWishlist(supabase, user.id);
  if (!wishlistId) return fail("Could not open your wishlist.");

  const { data: existing } = await supabase
    .from("wishlist_items")
    .select("id")
    .eq("wishlist_id", wishlistId)
    .eq("product_id", productId)
    .maybeSingle();

  if (existing?.id) {
    const { error } = await supabase
      .from("wishlist_items")
      .delete()
      .eq("id", existing.id);
    if (error) return fail(error.message);
    revalidatePath("/account/wishlist");
    revalidatePath("/account", "layout");
    return ok("Removed from your wishlist.", { added: false });
  }

  const { error } = await supabase
    .from("wishlist_items")
    .insert({ wishlist_id: wishlistId, product_id: productId });
  if (error) return fail(error.message);

  revalidatePath("/account/wishlist");
  revalidatePath("/account", "layout");
  return ok("Saved to your wishlist.", { added: true });
}

export async function removeWishlistItemAction(
  productId: string,
): Promise<ActionResult> {
  const user = await actionUser();
  if (!user) return fail("Sign in to manage your wishlist.", "auth");
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return fail("Supabase is not configured.", "not_configured");
  const wishlistId = await ensureWishlist(supabase, user.id);
  if (!wishlistId) return fail("Wishlist not found.");
  const { error } = await supabase
    .from("wishlist_items")
    .delete()
    .eq("wishlist_id", wishlistId)
    .eq("product_id", productId);
  if (error) return fail(error.message);
  revalidatePath("/account/wishlist");
  return ok("Removed from your wishlist.");
}
