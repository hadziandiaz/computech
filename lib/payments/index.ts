import "server-only";

import { paymentConfig } from "@/lib/env";
import type { Order } from "@/types/domain";

export interface PaymentIntent {
  provider: "manual" | "midtrans" | "xendit";
  method: string;
  paymentUrl: string | null;
  externalId: string | null;
  instructions: string;
}

export function manualPaymentInstructions(order: Pick<Order, "order_number" | "total">) {
  return [
    `Order ${order.order_number} totals ${new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(order.total)}.`,
    "Transfer the exact amount using the store bank account provided by staff.",
    "Include your order number in the transfer description.",
    "Your order is marked paid after staff verify the transfer.",
  ].join(" ");
}

export async function createPaymentIntent(
  order: Order,
): Promise<PaymentIntent> {
  const preferred = paymentConfig.provider;

  if (preferred === "midtrans" && paymentConfig.midtrans.serverKey) {
    try {
      const { createMidtransTransaction } = await import("@/lib/payments/midtrans");
      const result = await createMidtransTransaction(order);
      return {
        provider: "midtrans",
        method: "snap",
        paymentUrl: result.redirectUrl,
        externalId: result.externalId,
        instructions:
          "Complete payment on the secure Midtrans page. The order updates automatically after the payment notification is verified.",
      };
    } catch (error) {
      console.error("Midtrans transaction creation failed", error);
    }
  }

  if (preferred === "xendit" && paymentConfig.xendit.secretKey) {
    try {
      const { createXenditInvoice } = await import("@/lib/payments/xendit");
      const result = await createXenditInvoice(order);
      return {
        provider: "xendit",
        method: "invoice",
        paymentUrl: result.invoiceUrl,
        externalId: result.externalId,
        instructions:
          "Complete payment on the secure Xendit invoice page. The order updates automatically after the callback is verified.",
      };
    } catch (error) {
      console.error("Xendit invoice creation failed", error);
    }
  }

  return {
    provider: "manual",
    method: "bank_transfer",
    paymentUrl: null,
    externalId: null,
    instructions: manualPaymentInstructions(order),
  };
}
