import { describe, expect, it } from "vitest";

import {
  calculateOrderTotal,
  computeDiscount,
  effectiveShippingCost,
  evaluateVoucher,
  formatBudgetStatus,
  freeShippingApplies,
  productSavings,
  productUnitPrice,
  resolveUnitPrice,
} from "@/lib/pricing";
import type { Voucher } from "@/types/domain";

function voucher(overrides: Partial<Voucher> = {}): Voucher {
  return {
    id: "voucher-1",
    code: "SAVE10",
    name: "Save 10%",
    description: null,
    discount_type: "percentage",
    discount_value: 10,
    min_purchase: 0,
    max_discount: null,
    starts_at: "2020-01-01T00:00:00.000Z",
    expires_at: null,
    usage_limit: null,
    used_count: 0,
    per_user_limit: 1,
    is_active: true,
    created_at: "2020-01-01T00:00:00.000Z",
    updated_at: "2020-01-01T00:00:00.000Z",
    ...overrides,
  };
}

const NOW = new Date("2026-06-01T00:00:00.000Z");

describe("resolveUnitPrice", () => {
  it("returns the base price when there is no discount", () => {
    expect(resolveUnitPrice(1_000_000, null)).toBe(1_000_000);
  });

  it("uses the lower of price and discount price", () => {
    expect(resolveUnitPrice(1_000_000, 850_000)).toBe(850_000);
    expect(resolveUnitPrice(1_000_000, 1_200_000)).toBe(1_000_000);
  });

  it("never returns a negative price", () => {
    expect(resolveUnitPrice(1_000_000, -50)).toBe(0);
  });
});

describe("product helpers", () => {
  it("calculates savings against the base price", () => {
    expect(productSavings({ price: 2_000_000, discount_price: 1_750_000 })).toBe(250_000);
    expect(productSavings({ price: 2_000_000, discount_price: null })).toBe(0);
  });

  it("exposes the product unit price", () => {
    expect(productUnitPrice({ price: 500_000, discount_price: 400_000 })).toBe(400_000);
  });
});

describe("evaluateVoucher", () => {
  it("rejects a missing voucher", () => {
    expect(evaluateVoucher(null, 500_000, NOW).valid).toBe(false);
  });

  it("rejects inactive vouchers", () => {
    const result = evaluateVoucher(voucher({ is_active: false }), 500_000, NOW);
    expect(result.valid).toBe(false);
    expect(result.discount).toBe(0);
  });

  it("rejects vouchers that have not started", () => {
    const result = evaluateVoucher(
      voucher({ starts_at: "2027-01-01T00:00:00.000Z" }),
      500_000,
      NOW,
    );
    expect(result.valid).toBe(false);
  });

  it("rejects expired vouchers", () => {
    const result = evaluateVoucher(
      voucher({ expires_at: "2025-01-01T00:00:00.000Z" }),
      500_000,
      NOW,
    );
    expect(result.valid).toBe(false);
  });

  it("rejects vouchers that reached their usage limit", () => {
    const result = evaluateVoucher(
      voucher({ usage_limit: 5, used_count: 5 }),
      500_000,
      NOW,
    );
    expect(result.valid).toBe(false);
  });

  it("rejects carts below the minimum purchase", () => {
    const result = evaluateVoucher(voucher({ min_purchase: 1_000_000 }), 500_000, NOW);
    expect(result.valid).toBe(false);
  });

  it("calculates a percentage discount", () => {
    const result = evaluateVoucher(voucher(), 500_000, NOW);
    expect(result.valid).toBe(true);
    expect(result.discount).toBe(50_000);
  });

  it("caps the discount at max_discount", () => {
    const result = evaluateVoucher(voucher({ max_discount: 25_000 }), 500_000, NOW);
    expect(result.discount).toBe(25_000);
  });

  it("never discounts more than the subtotal", () => {
    const result = evaluateVoucher(
      voucher({ discount_type: "fixed", discount_value: 900_000 }),
      500_000,
      NOW,
    );
    expect(result.discount).toBe(500_000);
  });
});

describe("computeDiscount", () => {
  it("rounds percentage discounts to whole rupiah", () => {
    expect(computeDiscount(333_333, "percentage", 10)).toBe(33_333);
  });

  it("applies a maximum cap and clamps to subtotal", () => {
    expect(computeDiscount(1_000_000, "fixed", 250_000, 100_000)).toBe(100_000);
    expect(computeDiscount(100_000, "fixed", 250_000)).toBe(100_000);
  });
});

describe("calculateOrderTotal", () => {
  it("adds shipping after the discount", () => {
    expect(
      calculateOrderTotal({ subtotal: 1_000_000, discount: 100_000, shippingCost: 20_000 }),
    ).toBe(920_000);
  });

  it("never returns a negative total", () => {
    expect(
      calculateOrderTotal({ subtotal: 50_000, discount: 200_000, shippingCost: 0 }),
    ).toBe(0);
  });
});

describe("effectiveShippingCost", () => {
  it("returns zero without a method", () => {
    expect(effectiveShippingCost(500_000, null)).toBe(0);
  });

  it("honours the free shipping threshold", () => {
    expect(effectiveShippingCost(500_000, { cost: 20_000 }, 400_000)).toBe(0);
    expect(effectiveShippingCost(300_000, { cost: 20_000 }, 400_000)).toBe(20_000);
  });

  it("honours a free shipping promotion", () => {
    expect(effectiveShippingCost(100_000, { cost: 20_000 }, 0, true)).toBe(0);
  });
});

describe("freeShippingApplies", () => {
  it("applies the store-wide threshold", () => {
    expect(freeShippingApplies(500_000, [], 500_000)).toBe(true);
    expect(freeShippingApplies(499_999, [], 500_000)).toBe(false);
    expect(freeShippingApplies(0, [], 0)).toBe(false);
  });

  it("applies an active free-shipping promotion at its minimum purchase", () => {
    const promotions = [{ type: "free_shipping", min_purchase: 100_000 }] as const;
    expect(freeShippingApplies(150_000, promotions)).toBe(true);
    expect(freeShippingApplies(99_999, promotions)).toBe(false);
  });

  it("ignores promotion types that do not waive shipping", () => {
    const promotions = [{ type: "seasonal", min_purchase: 0 }] as const;
    expect(freeShippingApplies(150_000, promotions)).toBe(false);
  });
});

describe("formatBudgetStatus", () => {
  it("reports a safe build under 90%", () => {
    expect(formatBudgetStatus(8_000_000, 10_000_000)).toEqual({
      percentage: 80,
      remaining: 2_000_000,
      overBudget: false,
      tone: "safe",
    });
  });

  it("warns near the budget", () => {
    expect(formatBudgetStatus(9_500_000, 10_000_000).tone).toBe("warning");
  });

  it("flags an over-budget build", () => {
    const result = formatBudgetStatus(12_000_000, 10_000_000);
    expect(result.overBudget).toBe(true);
    expect(result.tone).toBe("over");
    expect(result.remaining).toBe(-2_000_000);
  });
});
