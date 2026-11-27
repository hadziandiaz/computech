import "server-only";

import { formatIDR } from "@/lib/format";
import { paymentConfig } from "@/lib/env";
import type {
  Order,
  PaymentInstruction,
  SiteSettings,
} from "@/types/domain";

export interface PaymentIntent {
  provider: "manual" | "midtrans" | "xendit";
  method: string;
  paymentUrl: string | null;
  externalId: string | null;
  instructions: string;
  detail: PaymentInstruction;
}

/** Deterministic 3-digit suffix taken from the order number. Staff can match
 * a transfer to an order even when the payer forgets the description. */
export function paymentUniqueCode(orderNumber: string): number {
  let hash = 0;
  for (let index = 0; index < orderNumber.length; index += 1) {
    hash = (hash * 31 + orderNumber.charCodeAt(index)) % 900;
  }
  return 100 + hash;
}

export function buildManualInstruction(
  order: Pick<Order, "order_number" | "total">,
  method: "bank_transfer" | "qris" | "cod",
  settings: SiteSettings,
): PaymentInstruction {
  const uniqueCode = paymentUniqueCode(order.order_number);
  const amountDue = order.total + uniqueCode;

  if (method === "cod") {
    return {
      kind: "cod",
      instructions: `${settings.cod_instructions} Total yang harus dibayar: ${formatIDR(order.total)}.`,
      uniqueCode,
      amountDue: order.total,
    };
  }

  if (method === "qris") {
    return {
      kind: "qris",
      instructions: `${settings.bank_transfer_instructions} Pindai QRIS ${settings.qris_merchant_name}, lalu masukkan nominal ${formatIDR(amountDue)} (sudah termasuk kode unik ${uniqueCode}). Cantumkan nomor order ${order.order_number} jika tersedia.`,
      uniqueCode,
      amountDue,
      qris: { merchantName: settings.qris_merchant_name, value: settings.qris_string },
    };
  }

  return {
    kind: "bank_transfer",
    instructions: `${settings.bank_transfer_instructions} Rekening: ${settings.bank_name} a.n. ${settings.bank_account_name}, nomor ${settings.bank_account_number}. Kode unik ${uniqueCode}, jadi nominal transfer ${formatIDR(amountDue)}. Cantumkan nomor order ${order.order_number}.`,
    uniqueCode,
    amountDue,
    bank: {
      bankName: settings.bank_name,
      accountName: settings.bank_account_name,
      accountNumber: settings.bank_account_number,
    },
  };
}

export async function createPaymentIntent(
  order: Order,
  method: string,
  settings: SiteSettings,
): Promise<PaymentIntent> {
  // Manual Indonesian methods never touch a payment gateway, even when a
  // provider is configured globally. Their instructions are snapshotted now.
  if (method === "bank_transfer" || method === "qris" || method === "cod") {
    const detail = buildManualInstruction(order, method, settings);
    return {
      provider: "manual",
      method,
      paymentUrl: null,
      externalId: null,
      instructions: detail.instructions,
      detail,
    };
  }

  if (paymentConfig.provider === "midtrans" && paymentConfig.midtrans.serverKey) {
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
        detail: { kind: "gateway", instructions: "Selesaikan pembayaran melalui halaman Midtrans." },
      };
    } catch (error) {
      console.error("Midtrans transaction creation failed", error);
    }
  }

  if (paymentConfig.provider === "xendit" && paymentConfig.xendit.secretKey) {
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
        detail: { kind: "gateway", instructions: "Selesaikan pembayaran melalui invoice Xendit." },
      };
    } catch (error) {
      console.error("Xendit invoice creation failed", error);
    }
  }

  const detail = buildManualInstruction(order, "bank_transfer", settings);
  return {
    provider: "manual",
    method: "bank_transfer",
    paymentUrl: null,
    externalId: null,
    instructions: detail.instructions,
    detail,
  };
}
