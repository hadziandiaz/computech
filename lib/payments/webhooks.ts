import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type PaymentOutcome = "paid" | "failed" | "expired";

/**
 * Applies a verified provider callback to the payment and order records.
 * Provider callbacks are not guaranteed to be unique, so the update is
 * idempotent: a second "paid" notification will not create a duplicate
 * customer notification or move the order again.
 */
export async function applyPaymentOutcome(input: {
  orderId: string;
  outcome: PaymentOutcome;
  provider: "midtrans" | "xendit";
  externalId?: string | null;
  method?: string | null;
  raw?: Record<string, unknown>;
}): Promise<{ ok: boolean; orderNumber?: string; message?: string }> {
  const admin = createSupabaseAdminClient();

  const { data: order, error } = await admin
    .from("orders")
    .select("id, order_number, user_id, status, payment:payments(status)")
    .eq("id", input.orderId)
    .maybeSingle();

  if (error || !order) {
    return { ok: false, message: "Order not found." };
  }

  const currentPayment = Array.isArray(order.payment)
    ? order.payment[0]
    : order.payment;
  const alreadyPaid = currentPayment?.status === "paid";

  const now = new Date().toISOString();
  const paymentUpdate: Record<string, unknown> = {
    status: input.outcome,
    provider: input.provider,
    raw_response: input.raw ?? null,
    updated_at: now,
  };
  if (input.externalId) paymentUpdate.external_id = input.externalId;
  if (input.method) paymentUpdate.method = input.method;
  if (input.outcome === "paid") paymentUpdate.paid_at = now;

  const { error: paymentError } = await admin
    .from("payments")
    .update(paymentUpdate)
    .eq("order_id", input.orderId);

  if (paymentError) {
    return { ok: false, message: paymentError.message };
  }

  if (input.outcome === "paid" && !alreadyPaid) {
    if (order.status === "pending") {
      await admin
        .from("orders")
        .update({ status: "confirmed", updated_at: now })
        .eq("id", input.orderId);
    }

    await admin.from("notifications").insert({
      user_id: order.user_id,
      type: "payment_confirmed",
      title: "Payment confirmed",
      body: `We received payment for order ${order.order_number}. Your order is being prepared.`,
      link: `/account/orders/${input.orderId}`,
    });
  }

  if (
    (input.outcome === "expired" || input.outcome === "failed") &&
    !alreadyPaid &&
    order.status === "pending"
  ) {
    await admin.rpc("cancel_order", {
      p_order_id: input.orderId,
      p_reason:
        input.outcome === "expired"
          ? "Payment expired"
          : "Payment failed at the payment provider",
    });
  }

  return { ok: true, orderNumber: order.order_number };
}
