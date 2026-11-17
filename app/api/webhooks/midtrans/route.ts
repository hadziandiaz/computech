import { NextResponse } from "next/server";

import { verifyMidtransSignature } from "@/lib/payments/midtrans";
import { applyPaymentOutcome } from "@/lib/payments/webhooks";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isServiceRoleConfigured, paymentConfig } from "@/lib/env";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface MidtransNotification {
  order_id?: string;
  status_code?: string;
  gross_amount?: string;
  signature_key?: string;
  transaction_status?: string;
  fraud_status?: string;
  payment_type?: string;
  transaction_id?: string;
  status_message?: string;
}

const SETTLED = new Set(["settlement", "capture"]);

export async function POST(request: Request) {
  if (!paymentConfig.midtrans.serverKey || !isServiceRoleConfigured) {
    return NextResponse.json(
      { ok: false, error: "Midtrans notifications are not configured." },
      { status: 503 },
    );
  }

  let body: MidtransNotification;
  try {
    body = (await request.json()) as MidtransNotification;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const {
    order_id: orderNumber,
    status_code: statusCode,
    gross_amount: grossAmount,
    signature_key: signatureKey,
    transaction_status: transactionStatus,
    fraud_status: fraudStatus,
  } = body;

  if (!orderNumber || !statusCode || !grossAmount || !signatureKey || !transactionStatus) {
    return NextResponse.json(
      { ok: false, error: "Missing required notification fields." },
      { status: 400 },
    );
  }

  const valid = await verifyMidtransSignature({
    orderId: orderNumber,
    statusCode,
    grossAmount,
    signatureKey,
  });
  if (!valid) {
    return NextResponse.json({ ok: false, error: "Invalid signature." }, { status: 401 });
  }

  const admin = createSupabaseAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("id")
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (!order?.id) {
    // Acknowledge unknown orders so Midtrans does not keep retrying, but log it.
    console.warn("Midtrans notification for unknown order", orderNumber);
    return NextResponse.json({ ok: true, ignored: "unknown_order" });
  }

  let outcome: "paid" | "failed" | "expired" | null = null;
  if (SETTLED.has(transactionStatus)) {
    outcome = fraudStatus === "challenge" ? null : "paid";
  } else if (transactionStatus === "expire") {
    outcome = "expired";
  } else if (["cancel", "deny", "failure"].includes(transactionStatus)) {
    outcome = "failed";
  }

  if (!outcome) {
    return NextResponse.json({ ok: true, ignored: transactionStatus });
  }

  const result = await applyPaymentOutcome({
    orderId: order.id,
    outcome,
    provider: "midtrans",
    externalId: body.transaction_id ?? orderNumber,
    method: body.payment_type ?? null,
    raw: body as Record<string, unknown>,
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, outcome, order: result.orderNumber });
}
