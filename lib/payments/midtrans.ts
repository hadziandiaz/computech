import "server-only";

import { paymentConfig, siteUrl } from "@/lib/env";
import type { Order } from "@/types/domain";

interface SnapResponse {
  token?: string;
  redirect_url?: string;
  error_messages?: string[];
}

export async function createMidtransTransaction(order: Order) {
  const { serverKey, isProduction } = paymentConfig.midtrans;
  const base = isProduction
    ? "https://app.midtrans.com"
    : "https://app.sandbox.midtrans.com";

  const payload = {
    transaction_details: {
      order_id: order.order_number,
      gross_amount: order.total,
    },
    customer_details: {
      first_name: order.customer_name,
      email: order.customer_email,
      phone: order.customer_phone,
    },
    item_details: (order.items ?? []).map((item) => ({
      id: item.product_sku,
      price: item.unit_price,
      quantity: item.quantity,
      name: item.product_name.slice(0, 50),
    })),
    callbacks: {
      finish: `${siteUrl}/account/orders/${order.id}`,
      error: `${siteUrl}/account/orders/${order.id}`,
      pending: `${siteUrl}/account/orders/${order.id}`,
    },
  };

  const response = await fetch(`${base}/snap/v1/transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Basic ${Buffer.from(`${serverKey}:`).toString("base64")}`,
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const data = (await response.json().catch(() => ({}))) as SnapResponse;
  if (!response.ok || !data.redirect_url) {
    throw new Error(
      data.error_messages?.join(", ") ||
        `Midtrans returned HTTP ${response.status} without a redirect URL.`,
    );
  }

  return {
    externalId: order.order_number,
    token: data.token ?? null,
    redirectUrl: data.redirect_url,
  };
}

export function verifyMidtransSignature(input: {
  orderId: string;
  statusCode: string;
  grossAmount: string;
  signatureKey: string;
}) {
  const { serverKey } = paymentConfig.midtrans;
  if (!serverKey) return false;
  const raw = `${input.orderId}${input.statusCode}${input.grossAmount}${serverKey}`;
  // Use Web Crypto so the check also works in the Node/Edge runtime used by
  // Firebase App Hosting without importing Node's crypto module.
  return sha512Hex(raw).then((digest) => digest === input.signatureKey);
}

async function sha512Hex(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-512", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
