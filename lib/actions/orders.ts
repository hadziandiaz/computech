"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  actionUser,
  fail,
  fieldErrors,
  firstZodMessage,
  numberValue,
  ok,
  text,
} from "@/lib/actions/helpers";
import type { ActionResult } from "@/lib/actions/types";
import { getAddressById } from "@/lib/data/addresses";
import { getShippingMethodById } from "@/lib/data/shipping";
import { getVoucherByCode } from "@/lib/data/vouchers";
import { getUserOrder } from "@/lib/data/orders";
import { paymentConfig } from "@/lib/env";
import { createPaymentIntent } from "@/lib/payments";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { tryCreateSupabaseServerClient } from "@/lib/supabase/server";

const checkoutSchema = z.object({
  address_id: z.string().uuid().optional().or(z.literal("")),
  recipient_name: z.string().trim().min(2, "Enter the recipient name.").max(100),
  phone: z.string().trim().min(8, "Enter a valid phone number.").max(30),
  province: z.string().trim().min(1, "Enter the province."),
  city: z.string().trim().min(1, "Enter the city."),
  district: z.string().trim().min(1, "Enter the district."),
  postal_code: z.string().trim().regex(/^[0-9]{4,6}$/, "Enter a valid postal code."),
  street: z.string().trim().min(5, "Enter the street address."),
  notes: z.string().trim().max(300).optional().or(z.literal("")),
  shipping_method_id: z.string().uuid("Choose a shipping method."),
  voucher_code: z.string().trim().max(40).optional().or(z.literal("")),
  payment_method: z.enum(["bank_transfer", "ewallet", "card", "qris"]),
  order_notes: z.string().trim().max(500).optional().or(z.literal("")),
});

export async function validateVoucherAction(
  code: string,
): Promise<ActionResult<{ discount: number; code: string; message: string }>> {
  const user = await actionUser();
  if (!user) return fail("Sign in to use a voucher.", "auth");
  const trimmed = code.trim().toUpperCase();
  if (!trimmed) return fail("Enter a voucher code.");

  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return fail("Supabase is not configured.", "not_configured");

  const { data: cart } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!cart?.id) return fail("Your cart is empty.");

  const { data: items } = await supabase
    .from("cart_items")
    .select("product_id, quantity")
    .eq("cart_id", cart.id);
  if (!items?.length) return fail("Your cart is empty.");

  let subtotal = 0;
  for (const item of items) {
    const { data: price } = await supabase.rpc("effective_price", {
      p_product_id: item.product_id,
    });
    subtotal += Number(price ?? 0) * item.quantity;
  }

  const { data: rows, error } = await supabase.rpc("voucher_quote", {
    p_code: trimmed,
    p_subtotal: subtotal,
  });
  if (error) return fail(error.message);

  const quote = Array.isArray(rows) ? rows[0] : rows;
  if (!quote?.valid) {
    return fail(quote?.message ?? "This voucher cannot be used.");
  }

  return ok(quote.message ?? "Voucher applied.", {
    discount: Number(quote.discount ?? 0),
    code: trimmed,
    message: quote.message ?? "Voucher applied.",
  });
}

function composeAddress(parsed: z.infer<typeof checkoutSchema>) {
  return {
    label: "Checkout",
    recipient_name: parsed.recipient_name,
    phone: parsed.phone,
    province: parsed.province,
    city: parsed.city,
    district: parsed.district,
    postal_code: parsed.postal_code,
    street: parsed.street,
    notes: parsed.notes || null,
  };
}

export async function placeOrderAction(formData: FormData): Promise<ActionResult> {
  const user = await actionUser();
  if (!user) return fail("Sign in to place your order.", "auth");

  const parsed = checkoutSchema.safeParse({
    address_id: text(formData, "address_id"),
    recipient_name: text(formData, "recipient_name"),
    phone: text(formData, "phone"),
    province: text(formData, "province"),
    city: text(formData, "city"),
    district: text(formData, "district"),
    postal_code: text(formData, "postal_code"),
    street: text(formData, "street"),
    notes: text(formData, "notes"),
    shipping_method_id: text(formData, "shipping_method_id"),
    voucher_code: text(formData, "voucher_code"),
    payment_method: text(formData, "payment_method"),
    order_notes: text(formData, "order_notes"),
  });
  if (!parsed.success) {
    return fail(firstZodMessage(parsed.error), "error", fieldErrors(parsed.error));
  }

  const shippingMethod = await getShippingMethodById(parsed.data.shipping_method_id);
  if (!shippingMethod || !shippingMethod.is_active) {
    return fail("The selected shipping method is unavailable.", "error", {
      shipping_method_id: ["Choose an active shipping method."],
    });
  }

  let address = composeAddress(parsed.data);
  if (parsed.data.address_id) {
    const saved = await getAddressById(user.id, parsed.data.address_id);
    if (saved) {
      address = {
        label: saved.label,
        recipient_name: saved.recipient_name,
        phone: saved.phone,
        province: saved.province,
        city: saved.city,
        district: saved.district,
        postal_code: saved.postal_code,
        street: saved.street,
        notes: saved.notes,
      };
    }
  }

  if (parsed.data.voucher_code) {
    const voucher = await getVoucherByCode(parsed.data.voucher_code);
    if (!voucher) {
      return fail("Voucher code not found.", "error", {
        voucher_code: ["Voucher code not found."],
      });
    }
  }

  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return fail("Supabase is not configured.", "not_configured");

  const { data, error } = await supabase.rpc("place_order", {
    p_shipping_address: address,
    p_shipping_method_id: parsed.data.shipping_method_id,
    p_voucher_code: parsed.data.voucher_code || null,
    p_payment_method: parsed.data.payment_method,
    p_payment_provider: paymentConfig.provider,
    p_notes: parsed.data.order_notes || null,
  });

  if (error) return fail(error.message);
  const result = (data ?? {}) as {
    order_id?: string;
    order_number?: string;
    total?: number;
  };
  if (!result.order_id) return fail("The order could not be created. Please try again.");

  const order = await getUserOrder(user.id, result.order_id);

  if (order) {
    try {
      const intent = await createPaymentIntent(order);
      const admin = createSupabaseAdminClient();
      await admin
        .from("payments")
        .update({
          provider: intent.provider,
          method: intent.method,
          external_id: intent.externalId,
          payment_url: intent.paymentUrl,
          expires_at: new Date(Date.now() + 86_400_000).toISOString(),
          raw_response: {
            instructions: intent.instructions,
            provider: intent.provider,
          },
        })
        .eq("order_id", order.id);
    } catch (paymentError) {
      console.error("Payment intent creation failed", paymentError);
    }
  }

  revalidatePath("/cart");
  revalidatePath("/account/orders");
  revalidatePath("/account", "layout");
  // Navigate on the server. Returning a redirectTo for the client to follow
  // is unreliable here: revalidating any path after the cart is emptied
  // re-renders the checkout route and the form unmounts before its effect can
  // run, leaving the shopper on "There is nothing to check out".
  // The destination page renders its own "Order placed successfully" banner.
  redirect(`/account/orders/${result.order_id}?created=1`);
}

export async function cancelOrderAction(
  orderId: string,
  reason = "Cancelled by customer",
): Promise<ActionResult> {
  const user = await actionUser();
  if (!user) return fail("Sign in to manage your order.", "auth");
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return fail("Supabase is not configured.", "not_configured");

  const { error } = await supabase.rpc("cancel_order", {
    p_order_id: orderId,
    p_reason: reason,
  });
  if (error) return fail(error.message);

  revalidatePath("/account/orders");
  revalidatePath(`/account/orders/${orderId}`);
  revalidatePath("/account", "layout");
  return ok("Order cancelled. Any reserved stock has been released.");
}

const reviewSchema = z.object({
  product_id: z.string().uuid("Choose a product."),
  order_item_id: z.string().uuid().optional().or(z.literal("")),
  rating: z.coerce.number().int().min(1, "Choose a rating.").max(5),
  title: z.string().trim().max(120).optional().or(z.literal("")),
  body: z
    .string()
    .trim()
    .min(10, "Write at least 10 characters so the review is useful.")
    .max(2000, "Reviews are limited to 2000 characters."),
});

export async function submitReviewAction(formData: FormData): Promise<ActionResult> {
  const user = await actionUser();
  if (!user) return fail("Sign in to write a review.", "auth");

  const parsed = reviewSchema.safeParse({
    product_id: text(formData, "product_id"),
    order_item_id: text(formData, "order_item_id"),
    rating: numberValue(formData, "rating"),
    title: text(formData, "title"),
    body: text(formData, "body"),
  });
  if (!parsed.success) {
    return fail(firstZodMessage(parsed.error), "error", fieldErrors(parsed.error));
  }

  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return fail("Supabase is not configured.", "not_configured");

  const reviewerName =
    user.profile?.full_name?.trim() || user.email.split("@")[0] || "COMPUTECH customer";

  const { error } = await supabase.from("product_reviews").insert({
    product_id: parsed.data.product_id,
    user_id: user.id,
    order_item_id: parsed.data.order_item_id || null,
    reviewer_name: reviewerName.slice(0, 80),
    rating: parsed.data.rating,
    title: parsed.data.title || null,
    body: parsed.data.body,
    is_approved: false,
    is_demo: false,
  });
  if (error) {
    if (error.code === "23505") {
      return fail("You have already reviewed this product.");
    }
    return fail(error.message);
  }

  revalidatePath(`/account/orders`);
  revalidatePath(`/account/reviews`);
  return ok("Thanks! Your review is awaiting moderation.");
}

export async function reorderAction(orderId: string): Promise<ActionResult> {
  const user = await actionUser();
  if (!user) return fail("Sign in to reorder.", "auth");
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return fail("Supabase is not configured.", "not_configured");

  const { data: order } = await supabase
    .from("orders")
    .select("id, items:order_items(product_id, quantity)")
    .eq("id", orderId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!order) return fail("Order not found.");

  const { ensureCart } = await import("@/lib/cart/service");
  const cartId = await ensureCart(supabase, user.id);
  if (!cartId) return fail("Could not open your cart.");

  let added = 0;
  for (const item of (order.items ?? []) as Array<{
    product_id: string | null;
    quantity: number;
  }>) {
    if (!item.product_id) continue;
    const { data: product } = await supabase
      .from("products")
      .select("id, status, inventory:product_inventory(stock)")
      .eq("id", item.product_id)
      .maybeSingle();
    const inventory = Array.isArray(product?.inventory)
      ? product?.inventory[0]
      : product?.inventory;
    const stock = inventory?.stock ?? 0;
    if (!product || product.status !== "active" || stock <= 0) continue;

    const quantity = Math.min(stock, item.quantity);
    await supabase.from("cart_items").upsert(
      { cart_id: cartId, product_id: item.product_id, quantity },
      { onConflict: "cart_id,product_id" },
    );
    added += 1;
  }

  revalidatePath("/cart");
  revalidatePath("/checkout");
  revalidatePath("/account", "layout");

  if (!added) {
    return fail("None of the products in this order are available right now.");
  }

  return { ...ok("Available items were added to your cart."), redirectTo: "/cart" };
}
