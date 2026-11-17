import "server-only";

import { paymentConfig, siteUrl } from "@/lib/env";
import type { Order } from "@/types/domain";

interface XenditInvoiceResponse {
  id?: string;
  invoice_url?: string;
  message?: string;
  error_code?: string;
}

export async function createXenditInvoice(order: Order) {
  const { secretKey } = paymentConfig.xendit;

  const payload = {
    external_id: order.id,
    amount: order.total,
    payer_email: order.customer_email,
    description: `COMPUTECH order ${order.order_number}`,
    invoice_duration: 86400,
    customer: {
      given_names: order.customer_name,
      mobile_number: order.customer_phone,
      email: order.customer_email,
    },
    customer_notification: {
      invoice_created: ["email"],
      invoice_reminder: ["email"],
      invoice_paid: ["email"],
    },
    success_redirect_url: `${siteUrl}/account/orders/${order.id}`,
    failure_redirect_url: `${siteUrl}/account/orders/${order.id}`,
    currency: "IDR",
  };

  const response = await fetch("https://api.xendit.co/v2/invoices", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${secretKey}:`).toString("base64")}`,
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const data = (await response.json().catch(() => ({}))) as XenditInvoiceResponse;
  if (!response.ok || !data.invoice_url) {
    throw new Error(
      data.message || `Xendit returned HTTP ${response.status} without an invoice URL.`,
    );
  }

  return {
    externalId: order.id,
    invoiceId: data.id ?? null,
    invoiceUrl: data.invoice_url,
  };
}
