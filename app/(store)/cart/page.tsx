import { ArrowRight, CheckCircle2, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import Link from "next/link";

import { PageHero } from "@/components/layout/page-hero";
import { CartLines } from "@/components/store/cart-lines";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getAuthUser, loginPath } from "@/lib/auth";
import { getCartSummary } from "@/lib/cart/service";
import { getActivePromotions } from "@/lib/data/promotions";
import { getSiteSettings } from "@/lib/data/settings";
import { formatIDR } from "@/lib/format";
import { freeShippingApplies } from "@/lib/pricing";

export const metadata = {
  title: "Cart",
  description: "Review the products in your COMPUTECH cart before checkout.",
};

export default async function CartPage() {
  const user = await getAuthUser();
  const [summary, settings, promotions] = await Promise.all([
    getCartSummary(user?.id ?? null),
    getSiteSettings(),
    getActivePromotions(),
  ]);

  const freeShipping = freeShippingApplies(
    summary.subtotal,
    promotions,
    settings.free_shipping_min,
  );
  const freeShippingGap = freeShipping
    ? 0
    : Math.max(0, settings.free_shipping_min - summary.subtotal);

  return (
    <>
      <PageHero
        eyebrow="Cart"
        title={
          <>
            {summary.item_count > 0 ? (
              <>
                {summary.item_count} item{summary.item_count === 1 ? "" : "s"} ready
                <br />
                <span className="text-violet">to become a build.</span>
              </>
            ) : (
              <>
                Your cart is
                <br />
                <span className="text-violet">waiting for parts.</span>
              </>
            )}
          </>
        }
        description="Prices and stock are read from the live catalog. Campaign pricing is confirmed again on the server when the order is placed."
        crumbs={[{ label: "Cart" }]}
        aside={
          summary.item_count > 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">Subtotal</p>
              <p className="mt-1 font-display text-2xl font-bold text-neon">{formatIDR(summary.subtotal)}</p>
              {summary.savings > 0 ? (
                <p className="mt-1 text-[11px] text-coral">You save {formatIDR(summary.savings)}</p>
              ) : null}
            </div>
          ) : undefined
        }
      />

      <div className="container-page py-8 lg:py-12">
        {!summary.lines.length ? (
          <EmptyState
            icon={<ShoppingBag className="size-5" />}
            title="Your cart is empty"
            description="Browse the catalog, open a saved build, or use the PC Builder to assemble a compatible system."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Link href="/products" className={buttonVariants({ size: "sm" })}>
                  Shop all products
                </Link>
                <Link href="/pc-builder" className={buttonVariants({ variant: "outline", size: "sm" })}>
                  Open PC Builder
                </Link>
              </div>
            }
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
            <div className="space-y-4">
              <CartLines lines={summary.lines} />

              {!user ? (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-violet/20 bg-violet-soft px-4 py-3">
                  <p className="text-[12px] font-medium text-violet-dark">
                    Your guest cart is stored in this browser. Sign in to merge it into your account.
                  </p>
                  <Link
                    href={loginPath("/cart")}
                    className={buttonVariants({ variant: "dark", size: "sm" })}
                  >
                    Sign in
                  </Link>
                </div>
              ) : null}

              <div className="flex items-center justify-between gap-3">
                <Link href="/products" className="inline-flex items-center gap-1 text-[12px] font-semibold text-violet hover:underline">
                  Continue shopping
                </Link>
                <Link href="/shipping" className="text-[12px] text-muted hover:text-ink">
                  Delivery information
                </Link>
              </div>
            </div>

            <aside className="space-y-4 lg:sticky lg:top-28">
              <div className="rounded-2xl border border-line bg-white p-5">
                <h2 className="font-display text-base font-semibold">Order summary</h2>
                <dl className="mt-3 space-y-2 text-[13px]">
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted">Subtotal</dt>
                    <dd className="font-semibold">{formatIDR(summary.subtotal)}</dd>
                  </div>
                  {summary.savings > 0 ? (
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted">Campaign savings</dt>
                      <dd className="font-semibold text-coral">−{formatIDR(summary.savings)}</dd>
                    </div>
                  ) : null}
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted">Shipping</dt>
                    <dd className="text-right text-[11px] text-muted">Selected at checkout</dd>
                  </div>
                  <div className="flex justify-between gap-4 border-t border-line pt-2 text-base">
                    <dt className="font-semibold">Estimated total</dt>
                    <dd className="font-display font-bold">{formatIDR(summary.subtotal)}</dd>
                  </div>
                </dl>

                {freeShipping ? (
                  <p className="mt-3 rounded-xl bg-[#e9f9ef] px-3 py-2 text-[11px] leading-relaxed text-[#18794e]">
                    Free shipping applies to this order. The shipping line is confirmed at checkout.
                  </p>
                ) : freeShippingGap > 0 ? (
                  <p className="mt-3 rounded-xl bg-mist px-3 py-2 text-[11px] leading-relaxed text-muted">
                    Add {formatIDR(freeShippingGap)} to reach the advertised free-shipping threshold.
                  </p>
                ) : null}

                <Link
                  href={user ? "/checkout" : loginPath("/checkout")}
                  className={`${buttonVariants({ size: "lg" })} mt-4 w-full`}
                >
                  {user ? "Proceed to checkout" : "Sign in to check out"} <ArrowRight />
                </Link>

                <ul className="mt-4 space-y-2 text-[11px] text-muted">
                  <li className="flex items-center gap-2">
                    <ShieldCheck className="size-3.5 text-violet" /> Stock validated when the order is created
                  </li>
                  <li className="flex items-center gap-2">
                    <Truck className="size-3.5 text-violet" /> Courier chosen at checkout
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="size-3.5 text-violet" /> Voucher checked server-side
                  </li>
                </ul>
              </div>
            </aside>
          </div>
        )}
      </div>
    </>
  );
}
