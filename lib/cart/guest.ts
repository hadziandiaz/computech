import "server-only";

import { cookies } from "next/headers";

export interface GuestCartItem {
  product_id: string;
  quantity: number;
}

const COOKIE_NAME = "ct_guest_cart";
const MAX_ITEMS = 20;
const MAX_QUANTITY = 10;

function safeParse(value: string | undefined): GuestCartItem[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (item): item is GuestCartItem =>
          typeof item?.product_id === "string" &&
          typeof item?.quantity === "number",
      )
      .slice(0, MAX_ITEMS)
      .map((item) => ({
        product_id: item.product_id,
        quantity: Math.max(1, Math.min(MAX_QUANTITY, Math.floor(item.quantity))),
      }));
  } catch {
    return [];
  }
}

export async function readGuestCart(): Promise<GuestCartItem[]> {
  const store = await cookies();
  return safeParse(store.get(COOKIE_NAME)?.value);
}

export async function writeGuestCart(items: GuestCartItem[]) {
  const store = await cookies();
  const merged = new Map<string, number>();
  for (const item of items.slice(0, MAX_ITEMS)) {
    merged.set(
      item.product_id,
      Math.min(MAX_QUANTITY, (merged.get(item.product_id) ?? 0) + item.quantity),
    );
  }
  const payload = Array.from(merged.entries()).map(([product_id, quantity]) => ({
    product_id,
    quantity,
  }));

  store.set(COOKIE_NAME, JSON.stringify(payload), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearGuestCart() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function guestCartCount() {
  const items = await readGuestCart();
  return items.reduce((sum, item) => sum + item.quantity, 0);
}
