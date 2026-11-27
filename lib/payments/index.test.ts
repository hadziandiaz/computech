import { describe, expect, it, vi } from "vitest";

import { buildManualInstruction, paymentUniqueCode } from "@/lib/payments";
import type { SiteSettings } from "@/types/domain";

vi.mock("server-only", () => ({}));

const settings = {
  bank_transfer_instructions: "Transfer ke rekening contoh.",
  bank_name: "Bank Contoh",
  bank_account_name: "COMPUTECH Demo",
  bank_account_number: "1234567890",
  qris_merchant_name: "COMPUTECH Demo",
  qris_string: "000201010211...6304ABCD",
  cod_instructions: "Bayar tunai saat diterima.",
} as SiteSettings;

describe("paymentUniqueCode", () => {
  it("returns a stable three-digit code", () => {
    const first = paymentUniqueCode("CT-20261127-ABCDE");
    expect(first).toBe(paymentUniqueCode("CT-20261127-ABCDE"));
    expect(first).toBeGreaterThanOrEqual(100);
    expect(first).toBeLessThanOrEqual(999);
  });

  it("changes with the order number", () => {
    expect(paymentUniqueCode("CT-20261127-AAAAA")).not.toBe(
      paymentUniqueCode("CT-20261127-BBBBB"),
    );
  });
});

describe("buildManualInstruction", () => {
  const order = { order_number: "CT-20261127-ABCDE", total: 1_250_000 };

  it("adds the unique code to the bank transfer amount", () => {
    const detail = buildManualInstruction(order, "bank_transfer", settings);
    expect(detail.kind).toBe("bank_transfer");
    expect(detail.bank?.accountNumber).toBe("1234567890");
    expect(detail.uniqueCode).toBe(paymentUniqueCode(order.order_number));
    expect(detail.amountDue).toBe(order.total + (detail.uniqueCode ?? 0));
    expect(detail.instructions).toContain("1234567890");
  });

  it("snapshots a static QRIS string and unique amount", () => {
    const detail = buildManualInstruction(order, "qris", settings);
    expect(detail.qris?.value).toBe(settings.qris_string);
    expect(detail.amountDue).toBe(order.total + (detail.uniqueCode ?? 0));
  });

  it("keeps the exact total for COD", () => {
    const detail = buildManualInstruction(order, "cod", settings);
    expect(detail.uniqueCode).toBe(paymentUniqueCode(order.order_number));
    expect(detail.amountDue).toBe(order.total);
    expect(detail.instructions).toContain("Bayar tunai saat diterima.");
  });
});
