import {
  AlertCircle,
  ArrowLeft,
  Banknote,
  CheckCircle2,
  CreditCard,
  MapPin,
  Package,
  RotateCcw,
  ShieldCheck,
  Truck,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductReviewForm } from "@/components/store/product-review-form";
import { Badge, statusTone } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { InlineButton } from "@/components/ui/action-form";
import { getAuthUser } from "@/lib/auth";
import { cancelOrderAction, reorderAction, submitReviewAction } from "@/lib/actions/orders";
import { getUserOrder } from "@/lib/data/orders";
import { getUserReviews } from "@/lib/data/reviews";
import { getSiteSettings } from "@/lib/data/settings";
import {
  orderStatusLabels,
  paymentStatusLabels,
  shipmentStatusLabels,
} from "@/lib/constants";
import { formatDate, formatDateTime, formatIDR } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Order detail",
};

const STEPS = ["pending", "confirmed", "processing", "shipped", "delivered", "completed"] as const;

export default async function AccountOrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getAuthUser();
  if (!user) return null;

  const { id } = await params;
  const query = await searchParams;
  const [order, settings, reviews] = await Promise.all([
    getUserOrder(user.id, id),
    getSiteSettings(),
    getUserReviews(user.id),
  ]);
  if (!order) notFound();

  const created = (Array.isArray(query.created) ? query.created[0] : query.created) === "1";
  const reviewedProductIds = new Set(reviews.map((review) => review.product_id));
  const canReview = ["delivered", "completed"].includes(order.status);
  const canCancel = ["pending", "confirmed"].includes(order.status);
  const activeIndex = STEPS.indexOf(order.status as (typeof STEPS)[number]);
  const itemCount = order.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  const payment = order.payment;
  const shipment = order.shipment;
  const address = order.shipping_address;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/account/orders"
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-muted transition-colors hover:text-ink"
        >
          <ArrowLeft className="size-3.5" /> All orders
        </Link>
        <div className="flex flex-wrap gap-2">
          <InlineButton
            action={reorderAction.bind(null, order.id)}
            variant="outline"
            size="sm"
            pendingText="Adding to cart…"
          >
            <RotateCcw /> Reorder
          </InlineButton>
          {canCancel ? (
            <InlineButton
              action={cancelOrderAction.bind(null, order.id, "Cancelled by customer")}
              variant="danger-ghost"
              size="sm"
              confirm="Cancel this order? Reserved stock will be released."
              pendingText="Cancelling…"
            >
              <XCircle /> Cancel order
            </InlineButton>
          ) : null}
        </div>
      </div>

      {created ? (
        <div className="flex items-start gap-3 rounded-2xl border border-[#b8ebc9] bg-[#e9f9ef] p-4 text-[#18794e]">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
          <div>
            <p className="text-sm font-semibold">Order placed successfully</p>
            <p className="mt-0.5 text-[12px] leading-relaxed">
              Complete the payment below to start processing. We will email you when the order
              status changes.
            </p>
          </div>
        </div>
      ) : null}

      <header className="rounded-2xl border border-line bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow text-violet">Order</p>
            <h1 className="mt-1 font-mono text-xl font-bold tracking-tight sm:text-2xl">
              {order.order_number}
            </h1>
            <p className="mt-1 text-xs text-muted">
              Placed {formatDateTime(order.created_at)} · {itemCount} item
              {itemCount === 1 ? "" : "s"}
            </p>
          </div>
          <div className="text-right">
            <Badge tone={statusTone(order.status)}>
              {orderStatusLabels[order.status] ?? order.status}
            </Badge>
            <p className="mt-2 font-display text-2xl font-bold">{formatIDR(order.total)}</p>
          </div>
        </div>

        {order.status !== "cancelled" ? (
          <ol className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {STEPS.map((step, index) => {
              const reached = activeIndex >= index;
              return (
                <li key={step} className="relative">
                  <span
                    className={cn(
                      "flex size-5 items-center justify-center rounded-full border-2 text-white",
                      reached ? "border-violet bg-violet" : "border-line bg-white",
                    )}
                  >
                    {reached ? <CheckCircle2 className="size-3" /> : null}
                  </span>
                  <span
                    className={cn(
                      "mt-1.5 block text-[10px] font-semibold leading-tight",
                      reached ? "text-ink" : "text-muted",
                    )}
                  >
                    {orderStatusLabels[step] ?? step}
                  </span>
                </li>
              );
            })}
          </ol>
        ) : (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-coral/20 bg-coral-soft/50 p-3 text-[12px] text-[#b23b46]">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>
              This order was cancelled{order.cancelled_reason ? `: ${order.cancelled_reason}` : "."}
            </span>
          </div>
        )}
      </header>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr] xl:items-start">
        <div className="space-y-6">
          <section className="overflow-hidden rounded-2xl border border-line bg-white">
            <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
              <h2 className="flex items-center gap-2 font-display text-base font-semibold">
                <Package className="size-4 text-violet" /> Items
              </h2>
              <span className="text-[11px] text-muted">{itemCount} total</span>
            </div>
            <ul className="divide-y divide-line">
              {(order.items ?? []).map((item) => (
                <li key={item.id} className="p-4 sm:p-5">
                  <div className="flex gap-3">
                    <span className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-line bg-mist">
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.product_name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : (
                        <span className="flex h-full items-center justify-center text-muted">
                          <Package className="size-5" />
                        </span>
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          {item.product_slug ? (
                            <Link
                              href={`/products/${item.product_slug}`}
                              className="line-clamp-2 text-[13px] font-semibold hover:text-violet-dark"
                            >
                              {item.product_name}
                            </Link>
                          ) : (
                            <p className="line-clamp-2 text-[13px] font-semibold">{item.product_name}</p>
                          )}
                          <p className="mt-0.5 font-mono text-[10px] text-muted">{item.product_sku}</p>
                          <p className="mt-1 flex items-center gap-1 text-[11px] text-muted">
                            <ShieldCheck className="size-3" />
                            {item.warranty_months > 0
                              ? `${item.warranty_months}-month warranty`
                              : "No warranty recorded"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[13px] font-semibold">{formatIDR(item.line_total)}</p>
                          <p className="text-[11px] text-muted">
                            {formatIDR(item.unit_price)} × {item.quantity}
                          </p>
                        </div>
                      </div>

                      {canReview && item.product_id && !reviewedProductIds.has(item.product_id) ? (
                        <details className="mt-3 rounded-xl border border-line bg-mist/40 p-3">
                          <summary className="cursor-pointer text-[12px] font-semibold text-violet">
                            Write a review for this item
                          </summary>
                          <div className="mt-3">
                            <ProductReviewForm
                              productId={item.product_id}
                              orderItemId={item.id}
                              action={submitReviewAction}
                            />
                          </div>
                        </details>
                      ) : null}
                    </div>
                  </div>
                </li>
              ))}
              {!order.items?.length ? (
                <li className="p-5 text-sm text-muted">No item lines are attached to this order.</li>
              ) : null}
            </ul>
          </section>

          <section className="rounded-2xl border border-line bg-white p-5">
            <h2 className="font-display text-base font-semibold">Order summary</h2>
            <dl className="mt-3 space-y-2 text-[13px]">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted">Subtotal</dt>
                <dd className="font-semibold">{formatIDR(order.subtotal)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted">
                  Discount{order.voucher_code ? ` (${order.voucher_code})` : ""}
                </dt>
                <dd className={order.discount > 0 ? "font-semibold text-[#18794e]" : "font-semibold"}>
                  {order.discount > 0 ? `−${formatIDR(order.discount)}` : formatIDR(0)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted">Shipping</dt>
                <dd className="font-semibold">
                  {order.shipping_cost > 0 ? formatIDR(order.shipping_cost) : "Free"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-line pt-2 text-base">
                <dt className="font-semibold">Total</dt>
                <dd className="font-display text-lg font-bold">{formatIDR(order.total)}</dd>
              </div>
            </dl>
          </section>

          {order.notes ? (
            <section className="rounded-2xl border border-line bg-white p-5">
              <h2 className="font-display text-base font-semibold">Order notes</h2>
              <p className="mt-2 whitespace-pre-line text-[13px] leading-relaxed text-muted">
                {order.notes}
              </p>
            </section>
          ) : null}
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-line bg-white p-5">
            <h2 className="flex items-center gap-2 font-display text-base font-semibold">
              {payment?.method === "bank_transfer" ? (
                <Banknote className="size-4 text-violet" />
              ) : (
                <CreditCard className="size-4 text-violet" />
              )}
              Payment
            </h2>
            <div className="mt-3 space-y-2 text-[12px]">
              <div className="flex items-center justify-between gap-3 border-b border-line/70 pb-2">
                <span className="text-muted">Status</span>
                <Badge tone={statusTone(payment?.status ?? "pending")}>
                  {paymentStatusLabels[payment?.status ?? "pending"] ?? payment?.status ?? "Pending"}
                </Badge>
              </div>
              <div className="flex items-center justify-between gap-3 border-b border-line/70 pb-2">
                <span className="text-muted">Provider</span>
                <span className="font-semibold">{payment?.provider ?? "manual"}</span>
              </div>
              <div className="flex items-center justify-between gap-3 border-b border-line/70 pb-2">
                <span className="text-muted">Method</span>
                <span className="font-semibold">
                  {(payment?.method ?? "bank_transfer").replaceAll("_", " ")}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted">Amount</span>
                <span className="font-semibold">{formatIDR(payment?.amount ?? order.total)}</span>
              </div>
            </div>

            {payment?.status === "pending" ? (
              <div className="mt-4 space-y-3">
                {payment.payment_url ? (
                  <Link
                    href={payment.payment_url}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(buttonVariants({ size: "md" }), "w-full")}
                  >
                    Continue to payment
                  </Link>
                ) : (
                  <div className="rounded-xl border border-line bg-mist/60 p-3 text-[11px] leading-relaxed text-muted">
                    <p className="font-semibold text-ink">
                      {payment.method === "bank_transfer"
                        ? "Bank transfer instructions"
                        : "Payment instructions"}
                    </p>
                    <p className="mt-1">{settings.bank_transfer_instructions}</p>
                    {payment.expires_at ? (
                      <p className="mt-2">
                        Complete payment before {formatDateTime(payment.expires_at)}.
                      </p>
                    ) : null}
                  </div>
                )}
                <Link
                  href="/contact"
                  className="block text-center text-[11px] font-semibold text-violet hover:underline"
                >
                  Need help with payment?
                </Link>
              </div>
            ) : null}
          </section>

          <section className="rounded-2xl border border-line bg-white p-5">
            <h2 className="flex items-center gap-2 font-display text-base font-semibold">
              <MapPin className="size-4 text-violet" /> Shipping address
            </h2>
            <div className="mt-3 text-[12px] leading-relaxed text-muted">
              <p className="font-semibold text-ink">{address?.recipient_name}</p>
              <p>{address?.phone}</p>
              <p className="mt-1">{address?.street}</p>
              <p>
                {address?.district}, {address?.city}
              </p>
              <p>
                {address?.province} {address?.postal_code}
              </p>
              {address?.notes ? <p className="mt-1 italic">{address.notes}</p> : null}
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-white p-5">
            <h2 className="flex items-center gap-2 font-display text-base font-semibold">
              <Truck className="size-4 text-violet" /> Shipment
            </h2>
            {shipment ? (
              <div className="mt-3 space-y-2 text-[12px]">
                <div className="flex items-center justify-between gap-3 border-b border-line/70 pb-2">
                  <span className="text-muted">Courier</span>
                  <span className="font-semibold">{shipment.courier}</span>
                </div>
                <div className="flex items-center justify-between gap-3 border-b border-line/70 pb-2">
                  <span className="text-muted">Service</span>
                  <span className="font-semibold">{shipment.service}</span>
                </div>
                <div className="flex items-center justify-between gap-3 border-b border-line/70 pb-2">
                  <span className="text-muted">Tracking</span>
                  <span className="font-mono text-[11px] font-semibold">
                    {shipment.tracking_number || "Not assigned"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted">Status</span>
                  <Badge tone={statusTone(shipment.status)}>
                    {shipmentStatusLabels[shipment.status] ?? shipment.status}
                  </Badge>
                </div>
                {shipment.shipped_at ? (
                  <p className="pt-1 text-[11px] text-muted">
                    Shipped {formatDate(shipment.shipped_at)}
                    {shipment.delivered_at
                      ? ` · delivered ${formatDate(shipment.delivered_at)}`
                      : ""}
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="mt-2 text-[12px] leading-relaxed text-muted">
                Tracking information appears once staff dispatch the order.
              </p>
            )}
          </section>

          <div id="reorder" className="rounded-2xl border border-line bg-mist/60 p-5">
            <h2 className="font-display text-sm font-semibold">Need this setup again?</h2>
            <p className="mt-1 text-[11px] leading-relaxed text-muted">
              Reorder adds every available item from this order to your cart at the current price.
            </p>
            <InlineButton
              action={reorderAction.bind(null, order.id)}
              variant="dark"
              size="sm"
              className="mt-3 w-full"
              pendingText="Adding to cart…"
            >
              <RotateCcw /> Reorder items
            </InlineButton>
          </div>
        </div>
      </div>
    </div>
  );
}
