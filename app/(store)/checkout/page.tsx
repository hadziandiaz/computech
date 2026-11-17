import { ArrowRight, ShoppingBag } from "lucide-react";
import Link from "next/link";

import { PageHero } from "@/components/layout/page-hero";
import { CheckoutForm } from "@/components/store/checkout-form";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/auth";
import { getCartSummary } from "@/lib/cart/service";
import { getAddresses } from "@/lib/data/addresses";
import { getActivePromotions } from "@/lib/data/promotions";
import { getShippingMethods } from "@/lib/data/shipping";
import { getSiteSettings } from "@/lib/data/settings";
import { paymentConfig } from "@/lib/env";
import { freeShippingApplies } from "@/lib/pricing";

export const metadata = {
  title: "Checkout",
  description: "Choose a delivery address, shipping service and payment method to place your order.",
};

export default async function CheckoutPage() {
  const user = await requireUser("/checkout");
  const [summary, addresses, shippingMethods, settings, promotions] = await Promise.all([
    getCartSummary(user.id),
    getAddresses(user.id),
    getShippingMethods(),
    getSiteSettings(),
    getActivePromotions(),
  ]);

  return (
    <>
      <PageHero
        eyebrow="Checkout"
        title="Confirm the details. Place the order."
        description="The address, delivery method, voucher and payment selection are validated on the server before the order is created."
        crumbs={[{ label: "Cart", href: "/cart" }, { label: "Checkout" }]}
      />

      <div className="container-page py-8 lg:py-12">
        {!summary.lines.length ? (
          <EmptyState
            icon={<ShoppingBag className="size-5" />}
            title="There is nothing to check out"
            description="Add products to your cart first, then return to checkout."
            action={
              <Link href="/products" className={buttonVariants({ size: "sm" })}>
                Browse products <ArrowRight />
              </Link>
            }
          />
        ) : (
          <CheckoutForm
            addresses={addresses}
            shippingMethods={shippingMethods}
            lines={summary.lines}
            subtotal={summary.subtotal}
            savings={summary.savings}
            defaultName={user.profile?.full_name || user.email.split("@")[0] || ""}
            defaultPhone={user.profile?.phone || ""}
            paymentProvider={paymentConfig.provider}
            bankInstructions={settings.bank_transfer_instructions}
            freeShippingEligible={freeShippingApplies(
              summary.subtotal,
              promotions,
              settings.free_shipping_min,
            )}
          />
        )}
      </div>
    </>
  );
}
