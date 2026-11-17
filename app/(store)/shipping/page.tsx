import { CheckCircle2, PackageCheck, Truck, Wallet } from "lucide-react";
import Link from "next/link";

import { PageHero } from "@/components/layout/page-hero";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { getShippingMethods } from "@/lib/data/shipping";
import { getSiteSettings } from "@/lib/data/settings";
import { formatIDR } from "@/lib/format";

export const metadata = {
  title: "Shipping and delivery",
  description:
    "Delivery methods, estimated lead times, shipping costs and order tracking for COMPUTECH orders.",
};

export default async function ShippingPage() {
  const [methods, settings] = await Promise.all([getShippingMethods(), getSiteSettings()]);

  const notes = [
    {
      icon: PackageCheck,
      title: "Stock checked at order time",
      detail: "Items are validated against live inventory before the order is accepted.",
    },
    {
      icon: Truck,
      title: "Courier and service recorded",
      detail: "The selected method is stored on the order together with its estimated window.",
    },
    {
      icon: Wallet,
      title: "Cost confirmed server-side",
      detail: "The shipping cost used for payment is recalculated from the active method.",
    },
  ];

  return (
    <>
      <PageHero
        eyebrow="Shipping"
        title={
          <>
            Delivered on terms
            <br />
            <span className="text-violet">you can see up front.</span>
          </>
        }
        description="Available delivery services, their cost and estimated windows come from the live shipping configuration. The method you choose is stored with your order."
        crumbs={[{ label: "Shipping" }]}
        aside={
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">
              Free shipping threshold
            </p>
            <p className="mt-1 font-display text-2xl font-bold text-neon">
              {settings.free_shipping_min > 0
                ? formatIDR(settings.free_shipping_min)
                : "Not configured"}
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-white/45">
              {settings.free_shipping_min > 0
                ? "Orders at or above this subtotal may qualify for free shipping when the store enables it."
                : "Free shipping is not currently advertised by the store."}
            </p>
          </div>
        }
      />

      <div className="container-page py-10 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-semibold">Available methods</h2>
                <p className="mt-1 text-sm text-muted">
                  Prices are per order. Choose a method at checkout.
                </p>
              </div>
              <Badge tone="cyan">{methods.length} active</Badge>
            </div>

            {methods.length ? (
              <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-white">
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-mist/70 text-[10px] uppercase tracking-[0.12em] text-muted">
                    <tr>
                      <th className="px-4 py-2.5 font-semibold">Service</th>
                      <th className="px-4 py-2.5 font-semibold">Estimate</th>
                      <th className="px-4 py-2.5 text-right font-semibold">Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {methods.map((method) => (
                      <tr key={method.id}>
                        <td className="px-4 py-3">
                          <p className="font-semibold">{method.name}</p>
                          <p className="mt-0.5 text-[11px] text-muted">
                            {method.courier}
                            {method.description ? ` · ${method.description}` : ""}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-muted">{method.estimated_days}</td>
                        <td className="px-4 py-3 text-right font-semibold">
                          {method.cost > 0 ? formatIDR(method.cost) : "Free"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-line bg-white p-6 text-sm text-muted">
                No shipping methods are configured yet. Staff can add methods in Admin → Settings.
              </div>
            )}

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {notes.map((note) => (
                <div key={note.title} className="rounded-2xl border border-line bg-white p-4">
                  <note.icon className="size-4 text-violet" />
                  <p className="mt-2 text-[13px] font-semibold">{note.title}</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-muted">{note.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="space-y-3">
            <div className="rounded-2xl border border-line bg-white p-5">
              <h2 className="font-display text-base font-semibold">How delivery is handled</h2>
              <ul className="mt-3 space-y-2.5 text-[12px] leading-relaxed text-muted">
                {[
                  "Checkout collects the recipient, phone, province, city, district, postal code and street address.",
                  "A saved address can be reused, or a new address can be entered for the order.",
                  "The order stores a snapshot of the address so later address edits do not rewrite history.",
                  "Staff mark the order shipped and record the courier, service and tracking number.",
                  "Tracking becomes visible when you look up the order with its number and email.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-violet" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl bg-ink p-5 text-white">
              <h2 className="font-display text-base font-semibold">Track a delivery</h2>
              <p className="mt-1 text-[12px] leading-relaxed text-white/55">
                Enter the order number and checkout email to see status and tracking details.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/track-order" className={buttonVariants({ size: "sm" })}>
                  Track an order
                </Link>
                <Link
                  href="/contact"
                  className={buttonVariants({
                    variant: "outline",
                    size: "sm",
                    className: "border-white/20 bg-transparent text-white hover:border-white/40 hover:bg-white/10",
                  })}
                >
                  Delivery question
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
