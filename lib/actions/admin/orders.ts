"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  actionAdmin,
  actionStaff,
  fail,
  fieldErrors,
  firstZodMessage,
  ok,
  text,
} from "@/lib/actions/helpers";
import type { ActionResult } from "@/lib/actions/types";
import { tryCreateSupabaseServerClient } from "@/lib/supabase/server";

const orderStatuses = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "completed",
  "cancelled",
] as const;

const statusSchema = z.object({
  order_id: z.string().uuid(),
  status: z.enum(orderStatuses),
  tracking_number: z.string().trim().max(80).optional().or(z.literal("")),
  courier: z.string().trim().max(60).optional().or(z.literal("")),
  service: z.string().trim().max(60).optional().or(z.literal("")),
});

export async function updateOrderStatusAction(
  formData: FormData,
): Promise<ActionResult> {
  const staff = await actionStaff();
  if (!staff) return fail("Staff access is required.", "forbidden");

  const parsed = statusSchema.safeParse({
    order_id: text(formData, "order_id"),
    status: text(formData, "status"),
    tracking_number: text(formData, "tracking_number"),
    courier: text(formData, "courier"),
    service: text(formData, "service"),
  });
  if (!parsed.success) {
    return fail(firstZodMessage(parsed.error), "error", fieldErrors(parsed.error));
  }

  if (parsed.data.status === "shipped" && !parsed.data.tracking_number) {
    return fail("Add a tracking number before marking the order as shipped.", "error", {
      tracking_number: ["Tracking number is required when shipping."],
    });
  }

  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return fail("Supabase is not configured.", "not_configured");

  const { error } = await supabase.rpc("staff_update_order_status", {
    p_order_id: parsed.data.order_id,
    p_status: parsed.data.status,
    p_tracking_number: parsed.data.tracking_number || null,
    p_courier: parsed.data.courier || null,
    p_service: parsed.data.service || null,
  });
  if (error) return fail(error.message);

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${parsed.data.order_id}`);
  revalidatePath("/account/orders");
  return ok("Order status updated.");
}

export async function markPaymentPaidAction(orderId: string): Promise<ActionResult> {
  const staff = await actionStaff();
  if (!staff) return fail("Staff access is required.", "forbidden");
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return fail("Supabase is not configured.", "not_configured");

  const { data: order } = await supabase
    .from("orders")
    .select("id, order_number, user_id, status")
    .eq("id", orderId)
    .maybeSingle();
  if (!order) return fail("Order not found.");
  if (order.status === "cancelled") {
    return fail("A cancelled order cannot be marked as paid.");
  }

  const { error: paymentError } = await supabase
    .from("payments")
    .update({ status: "paid", paid_at: new Date().toISOString() })
    .eq("order_id", orderId);
  if (paymentError) return fail(paymentError.message);

  if (order.status === "pending") {
    await supabase.from("orders").update({ status: "confirmed" }).eq("id", orderId);
  }

  await supabase.from("notifications").insert({
    user_id: order.user_id,
    type: "payment_confirmed",
    title: "Payment confirmed",
    body: `Payment for order ${order.order_number} has been confirmed.`,
    link: `/account/orders/${orderId}`,
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/account/orders");
  return ok("Payment marked as received.");
}

export async function refundOrderAction(orderId: string): Promise<ActionResult> {
  const admin = await actionAdmin();
  if (!admin) return fail("Administrator access is required.", "forbidden");
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return fail("Supabase is not configured.", "not_configured");

  const { data: order } = await supabase
    .from("orders")
    .select("id, order_number, status")
    .eq("id", orderId)
    .maybeSingle();
  if (!order) return fail("Order not found.");

  const { error } = await supabase
    .from("payments")
    .update({ status: "refunded" })
    .eq("order_id", orderId);
  if (error) return fail(error.message);

  if (["pending", "confirmed", "processing"].includes(order.status)) {
    await supabase.rpc("cancel_order", {
      p_order_id: orderId,
      p_reason: "Refunded by administrator",
    });
  } else {
    await supabase
      .from("orders")
      .update({ cancelled_reason: "Refunded by administrator" })
      .eq("id", orderId);
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/account/orders");
  return ok("Order payment marked as refunded.");
}
