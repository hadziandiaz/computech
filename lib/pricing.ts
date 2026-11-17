import type {
  CartLine,
  DiscountType,
  Product,
  Promotion,
  ShippingMethod,
  Voucher,
} from "@/types/domain";

export function resolveUnitPrice(
  price: number,
  discountPrice?: number | null,
) {
  if (discountPrice == null) return price;
  if (discountPrice < 0) return 0;
  return Math.min(price, discountPrice);
}

export function productUnitPrice(product: Pick<Product, "price" | "discount_price">) {
  return resolveUnitPrice(product.price, product.discount_price);
}

export function productSavings(product: Pick<Product, "price" | "discount_price">) {
  return Math.max(0, product.price - productUnitPrice(product));
}

export function calculateCartTotals(lines: CartLine[]) {
  const subtotal = lines.reduce((sum, line) => sum + line.line_total, 0);
  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);
  const savings = lines.reduce(
    (sum, line) => sum + (line.product.price - line.unit_price) * line.quantity,
    0,
  );
  return { subtotal, itemCount, savings };
}

export interface VoucherEvaluation {
  valid: boolean;
  discount: number;
  message: string;
}

export function evaluateVoucher(
  voucher: Voucher | null | undefined,
  subtotal: number,
  now = new Date(),
): VoucherEvaluation {
  if (!voucher) {
    return { valid: false, discount: 0, message: "Voucher code not found." };
  }
  if (!voucher.is_active) {
    return { valid: false, discount: 0, message: "This voucher is inactive." };
  }
  if (voucher.starts_at && new Date(voucher.starts_at) > now) {
    return { valid: false, discount: 0, message: "This voucher is not active yet." };
  }
  if (voucher.expires_at && new Date(voucher.expires_at) < now) {
    return { valid: false, discount: 0, message: "This voucher has expired." };
  }
  if (voucher.usage_limit != null && voucher.used_count >= voucher.usage_limit) {
    return {
      valid: false,
      discount: 0,
      message: "This voucher has reached its usage limit.",
    };
  }
  if (subtotal < voucher.min_purchase) {
    return {
      valid: false,
      discount: 0,
      message: "Your cart has not reached this voucher's minimum purchase.",
    };
  }

  let discount = 0;
  if (voucher.discount_type === "percentage") {
    discount = Math.round((subtotal * voucher.discount_value) / 100);
  } else {
    discount = voucher.discount_value;
  }
  if (voucher.max_discount != null) {
    discount = Math.min(discount, voucher.max_discount);
  }
  discount = Math.max(0, Math.min(discount, subtotal));

  return { valid: true, discount, message: "Voucher applied." };
}

export function computeDiscount(
  subtotal: number,
  discountType: DiscountType,
  discountValue: number,
  maxDiscount?: number | null,
) {
  let discount =
    discountType === "percentage"
      ? Math.round((subtotal * discountValue) / 100)
      : discountValue;
  if (maxDiscount != null) discount = Math.min(discount, maxDiscount);
  return Math.max(0, Math.min(discount, subtotal));
}

export function calculateOrderTotal(input: {
  subtotal: number;
  discount: number;
  shippingCost: number;
}) {
  return Math.max(0, input.subtotal - input.discount + input.shippingCost);
}

export function effectiveShippingCost(
  subtotal: number,
  method: Pick<ShippingMethod, "cost"> | null | undefined,
  freeShippingThreshold = 0,
  freeShippingPromotion = false,
) {
  if (!method) return 0;
  if (freeShippingPromotion) return 0;
  if (freeShippingThreshold > 0 && subtotal >= freeShippingThreshold) return 0;
  return method.cost;
}

/**
 * Mirrors the free-shipping rule in public.place_order(): shipping is waived
 * when the subtotal meets the store threshold or an active free_shipping
 * promotion's minimum purchase. Pass promotions that are already filtered for
 * active status, date window and remaining usage.
 */
export function freeShippingApplies(
  subtotal: number,
  promotions: ReadonlyArray<Pick<Promotion, "type" | "min_purchase">> = [],
  threshold = 0,
) {
  if (threshold > 0 && subtotal >= threshold) return true;
  return promotions.some(
    (promotion) => promotion.type === "free_shipping" && subtotal >= promotion.min_purchase,
  );
}

export function formatBudgetStatus(total: number, budget: number) {
  const percentage = budget > 0 ? Math.round((total / budget) * 100) : 0;
  const remaining = budget - total;
  return {
    percentage,
    remaining,
    overBudget: remaining < 0,
    tone:
      percentage > 100
        ? ("over" as const)
        : percentage >= 90
          ? ("warning" as const)
          : ("safe" as const),
  };
}
