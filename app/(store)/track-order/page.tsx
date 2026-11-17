import { AlertCircle, CheckCircle2, Package, Search, Truck } from "lucide-react";
import Link from "next/link";

import { PageHero } from "@/components/layout/page-hero";
import { Badge, statusTone } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { getOrderByNumber } from "@/lib/data/orders";
import { formatDate, formatIDR } from "@/lib/format";
import { orderStatusLabels, shipmentStatusLabels } from "@/lib/constants";

export const metadata = {
  title: "Track order",
  description:
    "Track a COMPUTECH order using the order number and the email address used at checkout.",
};

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

interface TrackedItem {
  name?: string;
  quantity?: number;
  image_url?: string | null;
}

interface TrackedShipment {
  courier?: string | null;
  service?: string | null;
  tracking_number?: string | null;
  status?: string | null;
  shipped_at?: string | null;
  delivered_at?: string | null;
}

export default async function TrackOrderPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const orderNumber = single(params.order).trim().toUpperCase();
  const email = single(params.email).trim();
  const attempted = Boolean(orderNumber && email);
  const result = attempted ? await getOrderByNumber(orderNumber, email) : null;

  const status = String(result?.status ?? "");
  const items = (Array.isArray(result?.items) ? result?.items : []) as TrackedItem[];
  const shipment =
    result?.shipment && typeof result.shipment === "object"
      ? (result.shipment as TrackedShipment)
      : null;

  return (
    <>
      <PageHero
        eyebrow="Order tracking"
        title={
          <>
            Where is
            <br />
            <span className="text-violet">your order?</span>
          </>
        }
        description="Look up an order with its number and the email used at checkout. Tracking details appear once the order has shipped."
        crumbs={[{ label: "Track order" }]}
      />

      <div className="container-page py-10 lg:py-14">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_1fr] lg:items-start">
          <form
            method="get"
            className="rounded-2xl border border-line bg-white p-5 lg:sticky lg:top-28"
          >
            <h2 className="flex items-center gap-2 font-display text-base font-semibold">
              <Search className="size-4 text-violet" /> Find your order
            </h2>
            <p className="mt-1 text-xs text-muted">
              Both fields must match the order exactly.
            </p>
            <div className="mt-4 space-y-3">
              <div>
                <Label htmlFor="order" required>
                  Order number
                </Label>
                <Input
                  id="order"
                  name="order"
                  defaultValue={orderNumber}
                  placeholder="CT-2026-000001"
                  autoComplete="off"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email" required>
                  Checkout email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={email}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>
              <button type="submit" className={`${buttonVariants({ size: "md" })} w-full`}>
                <Search /> Track order
              </button>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-muted">
              Signed in? Your orders are always available under{" "}
              <Link href="/account/orders" className="font-semibold text-violet hover:underline">
                My Orders
              </Link>
              .
            </p>
          </form>

          <div>
            {!attempted ? (
              <div className="rounded-2xl border border-dashed border-line bg-white p-8 text-center">
                <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-violet-soft text-violet">
                  <Package className="size-5" />
                </span>
                <h2 className="mt-3 font-display text-lg font-semibold">Ready when you are</h2>
                <p className="mx-auto mt-1 max-w-md text-sm text-muted">
                  Enter the order number from your confirmation and the email used at checkout to
                  see the current status, items and shipment details.
                </p>
              </div>
            ) : !result ? (
              <div className="rounded-2xl border border-coral/20 bg-coral-soft/50 p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 size-5 shrink-0 text-coral" />
                  <div>
                    <h2 className="font-display text-base font-semibold">No order found</h2>
                    <p className="mt-1 text-[13px] leading-relaxed text-muted">
                      Check the order number and use the same email that was entered at checkout.
                      For privacy, we do not reveal whether the order exists when the details do not
                      match.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link href="/contact" className={buttonVariants({ variant: "outline", size: "sm" })}>
                        Contact support
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-2xl border border-line bg-white p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                        Order
                      </p>
                      <h2 className="mt-0.5 font-display text-xl font-bold">
                        {String(result.order_number ?? orderNumber)}
                      </h2>
                      <p className="mt-1 text-xs text-muted">
                        Placed {result.created_at ? formatDate(String(result.created_at)) : "—"}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge tone={statusTone(status)}>
                        {orderStatusLabels[status] ?? status ?? "Unknown"}
                      </Badge>
                      <p className="mt-2 font-display text-lg font-bold">
                        {formatIDR(Number(result.total ?? 0))}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="relative">
                      <div className="absolute left-0 right-0 top-2 h-0.5 bg-line" aria-hidden />
                      <ol className="relative grid grid-cols-4 gap-2">
                        {["pending", "processing", "shipped", "completed"].map((step) => {
                          const order = ["pending", "confirmed", "processing", "shipped", "delivered", "completed"];
                          const activeIndex = order.indexOf(status);
                          const stepIndex = order.indexOf(step);
                          const reached = activeIndex >= stepIndex && activeIndex >= 0;
                          return (
                            <li key={step} className="text-center">
                              <span
                                className={`mx-auto flex size-4 items-center justify-center rounded-full border-2 ${
                                  reached
                                    ? "border-violet bg-violet text-white"
                                    : "border-line bg-white"
                                }`}
                              >
                                {reached ? <CheckCircle2 className="size-2.5" /> : null}
                              </span>
                              <span className="mt-1.5 block text-[10px] font-medium capitalize text-muted">
                                {orderStatusLabels[step] ?? step}
                              </span>
                            </li>
                          );
                        })}
                      </ol>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-line bg-white p-5">
                  <h3 className="flex items-center gap-2 font-display text-base font-semibold">
                    <Truck className="size-4 text-violet" /> Shipment
                  </h3>
                  {shipment ? (
                    <dl className="mt-3 grid gap-x-6 gap-y-2 text-[12px] sm:grid-cols-2">
                      <div className="flex justify-between gap-3 border-b border-line/70 py-1.5">
                        <dt className="text-muted">Courier</dt>
                        <dd className="font-semibold">{shipment.courier || "—"}</dd>
                      </div>
                      <div className="flex justify-between gap-3 border-b border-line/70 py-1.5">
                        <dt className="text-muted">Service</dt>
                        <dd className="font-semibold">{shipment.service || "—"}</dd>
                      </div>
                      <div className="flex justify-between gap-3 border-b border-line/70 py-1.5">
                        <dt className="text-muted">Tracking number</dt>
                        <dd className="font-mono text-[11px] font-semibold">
                          {shipment.tracking_number || "Not assigned yet"}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-3 border-b border-line/70 py-1.5">
                        <dt className="text-muted">Shipment status</dt>
                        <dd className="font-semibold">
                          {shipmentStatusLabels[shipment.status ?? ""] ?? shipment.status ?? "—"}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-3 border-b border-line/70 py-1.5">
                        <dt className="text-muted">Shipped</dt>
                        <dd className="font-semibold">
                          {shipment.shipped_at ? formatDate(shipment.shipped_at) : "—"}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-3 border-b border-line/70 py-1.5">
                        <dt className="text-muted">Delivered</dt>
                        <dd className="font-semibold">
                          {shipment.delivered_at ? formatDate(shipment.delivered_at) : "—"}
                        </dd>
                      </div>
                    </dl>
                  ) : (
                    <p className="mt-2 text-[13px] leading-relaxed text-muted">
                      A shipment has not been created yet. Tracking information appears after staff
                      dispatch the order.
                    </p>
                  )}
                </div>

                <div className="rounded-2xl border border-line bg-white p-5">
                  <h3 className="flex items-center gap-2 font-display text-base font-semibold">
                    <Package className="size-4 text-violet" /> Items
                  </h3>
                  <ul className="mt-3 divide-y divide-line">
                    {items.map((item, index) => (
                      <li key={`${item.name}-${index}`} className="flex items-center justify-between gap-4 py-2.5">
                        <p className="text-[13px] font-medium">{item.name ?? "Item"}</p>
                        <span className="text-[12px] text-muted">× {item.quantity ?? 1}</span>
                      </li>
                    ))}
                    {!items.length ? <li className="py-2 text-sm text-muted">No item lines found.</li> : null}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
