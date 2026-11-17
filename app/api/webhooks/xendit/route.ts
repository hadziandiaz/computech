import { NextResponse } from "next/server";

import { applyPaymentOutcome } from "@/lib/payments/webhooks";
import { isServiceRoleConfigured, paymentConfig } from "@/lib/env";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface XenditInvoiceCallback {
  id?: string;
  external_id?: string;
  status?: string;
  paid_amount?: number;
  payment_method?: string;
  payment_channel?: string;
  paid_at?: string;
}

export async function POST(request: Request) {
  const { callbackToken } = paymentConfig.xendit;

  if (!callbackToken || !isServiceRoleConfigured) {
    return NextResponse.json(
      { ok: false, error: "Xendit callbacks are not configured." },
      { status: 503 },
    );
  }

  const token = request.headers.get("x-callback-token");
  if (token !== callbackToken) {
    return NextResponse.json({ ok: false, error: "Invalid callback token." }, { status: 401 });
  }

  let body: XenditInvoiceCallback;
  try {
    body = (await request.json()) as XenditInvoiceCallback;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const orderId = body.external_id;
  const status = (body.status ?? "").toUpperCase();

  if (!orderId || !status) {
    return NextResponse.json(
      { ok: false, error: "Missing external_id or status." },
      { status: 400 },
    );
  }

  let outcome: "paid" | "failed" | "expired" | null = null;
  if (status === "PAID" || status === "SETTLED") {
    outcome = "paid";
  } else if (status === "EXPIRED") {
    outcome = "expired";
  } else if (status === "FAILED") {
    outcome = "failed";
  }

  if (!outcome) {
    return NextResponse.json({ ok: true, ignored: status });
  }

  const result = await applyPaymentOutcome({
    orderId,
    outcome,
    provider: "xendit",
    externalId: body.id ?? orderId,
    method: body.payment_method ?? body.payment_channel ?? null,
    raw: body as Record<string, unknown>,
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, outcome, order: result.orderNumber });
}
