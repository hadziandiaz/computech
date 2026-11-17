import {
  ArrowLeft,
  Banknote,
  CheckCircle2,
  CreditCard,
  MapPin,
  Package,
  RotateCcw,
  Truck,
  UserRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminHeader } from "@/components/admin/admin-header";
import { ActionForm, InlineButton, SubmitButton } from "@/components/ui/action-form";
import { Badge, statusTone } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";
import {
  markPaymentPaidAction,
  refundOrderAction,
  updateOrderStatusAction,
} from "@/lib/actions/admin/orders";
import { getAuthUser } from "@/lib/auth";
import { getAdminOrder } from "@/lib/data/orders";
import {
  orderStatusLabels,
  paymentStatusLabels,
  shipmentStatusLabels,
} from "@/lib/constants";
import { formatDateTime, formatIDR } from "@/lib/format";

export const metadata = {
  title: "Order detail",
};

const STATUS_OPTIONS = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "completed",
  "cancelled",
] as const;

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [order, user] = await Promise.all([getAdminOrder(id), getAuthUser()]);
  if (!order) notFound();

  const payment = order.payment;
  const shipment = order.shipment;
  const address = order.shipping_address;
  const itemCount = order.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return (
    <div>
      <Link
        href="/admin/orders"
        className="mb-4 inline-flex items-center gap-1.5 text-[12px] font-semibold text-muted hover:text-ink"
      >
        <ArrowLeft className="size-3.5" /> Back to orders
      </Link>
      <AdminHeader
        eyebrow="Operations"
        title={order.order_number}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <Badge tone={statusTone(order.status)}>
              {orderStatusLabels[order.status] ?? order.status}
            </Badge>
            <span className="text-[11px] text-muted">
              Placed {formatDateTime(order.created_at)} · {itemCount} item
              {itemCount === 1 ? "" : "s"}
            </span>
          </span>
        }
        actions={
          <>
            <Link
              href={`/account/orders/${order.id}`}
              target="_blank"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Customer view
            </Link>
            {payment && payment.status !== "paid" && payment.status !== "refunded" ? (
              <InlineButton
                action={markPaymentPaidAction.bind(null, order.id)}
                variant="primary"
                size="sm"
                pendingText="Confirming…"
              >
                <CheckCircle2 /> Mark payment paid
              </InlineButton>
            ) : null}
            {user?.role === "admin" && payment?.status === "paid" ? (
              <InlineButton
                action={refundOrderAction.bind(null, order.id)}
                variant="danger-ghost"
                size="sm"
                confirm="Mark this payment as refunded and cancel the order where possible?"
                pendingText="Refunding…"
              >
                <RotateCcw /> Refund
              </InlineButton>
            ) : null}
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr] xl:items-start">
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
                <li key={item.id} className="flex items-center gap-3 px-4 py-3 sm:px-5">
                  <span className="relative size-12 shrink-0 overflow-hidden rounded-xl border border-line bg-mist">
                    {item.image_url ? (
                      <Image
                        src={item.image_url}
                        alt={item.product_name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center text-muted">
                        <Package className="size-4" />
                      </span>
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    {item.product_id ? (
                      <Link
                        href={`/admin/products/${item.product_id}`}
                        className="line-clamp-1 text-[13px] font-semibold hover:text-violet-dark"
                      >
                        {item.product_name}
                      </Link>
                    ) : (
                      <p className="line-clamp-1 text-[13px] font-semibold">{item.product_name}</p>
                    )}
                    <p className="font-mono text-[10px] text-muted">
                      {item.product_sku} · warranty {item.warranty_months}m
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[12px] font-semibold">{formatIDR(item.line_total)}</p>
                    <p className="text-[10px] text-muted">
                      {formatIDR(item.unit_price)} × {item.quantity}
                    </p>
                  </div>
                </li>
              ))}
              {!order.items?.length ? (
                <li className="px-5 py-6 text-center text-[13px] text-muted">
                  This order has no item lines.
                </li>
              ) : null}
            </ul>
            <dl className="space-y-2 border-t border-line bg-mist/30 px-5 py-4 text-[12px]">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted">Subtotal</dt>
                <dd className="font-semibold">{formatIDR(order.subtotal)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted">
                  Discount{order.voucher_code ? ` (${order.voucher_code})` : ""}
                </dt>
                <dd className="font-semibold">
                  {order.discount > 0 ? `−${formatIDR(order.discount)}` : formatIDR(0)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted">Shipping</dt>
                <dd className="font-semibold">
                  {order.shipping_cost > 0 ? formatIDR(order.shipping_cost) : "Free"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-line pt-2 text-sm">
                <dt className="font-semibold">Total</dt>
                <dd className="font-display text-base font-bold">{formatIDR(order.total)}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-2xl border border-line bg-white p-5">
            <h2 className="font-display text-base font-semibold">Update fulfilment</h2>
            <p className="mt-1 text-[12px] text-muted">
              Status changes notify the customer. Marking an order shipped requires a tracking
              number and writes it to the shipment record.
            </p>
            <ActionForm action={updateOrderStatusAction} className="mt-4 space-y-3">
              <input type="hidden" name="order_id" value={order.id} />
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Order status" htmlFor="status">
                  <Select id="status" name="status" defaultValue={order.status}>
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {orderStatusLabels[status] ?? status}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Courier" htmlFor="courier" hint="Used when marking shipped.">
                  <Input
                    id="courier"
                    name="courier"
                    defaultValue={shipment?.courier ?? ""}
                    placeholder="JNE, SiCepat, Anteraja…"
                  />
                </Field>
                <Field label="Service" htmlFor="service">
                  <Input
                    id="service"
                    name="service"
                    defaultValue={shipment?.service ?? ""}
                    placeholder="REG, YES, Same Day"
                  />
                </Field>
                <Field label="Tracking number" htmlFor="tracking_number">
                  <Input
                    id="tracking_number"
                    name="tracking_number"
                    defaultValue={shipment?.tracking_number ?? ""}
                    placeholder="AWB / resi"
                  />
                </Field>
              </div>
              <SubmitButton size="sm" pendingText="Updating…">
                Update order
              </SubmitButton>
            </ActionForm>
          </section>

          {order.notes ? (
            <section className="rounded-2xl border border-line bg-white p-5">
              <h2 className="font-display text-base font-semibold">Customer notes</h2>
              <p className="mt-2 whitespace-pre-line text-[13px] leading-relaxed text-muted">
                {order.notes}
              </p>
            </section>
          ) : null}

          {order.cancelled_reason ? (
            <section className="rounded-2xl border border-coral/25 bg-coral-soft/40 p-5">
              <h2 className="font-display text-base font-semibold text-[#b23b46]">
                Cancellation
              </h2>
              <p className="mt-2 text-[13px] text-[#b23b46]">{order.cancelled_reason}</p>
            </section>
          ) : null}
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-line bg-white p-5">
            <h2 className="flex items-center gap-2 font-display text-base font-semibold">
              <UserRound className="size-4 text-violet" /> Customer
            </h2>
            <div className="mt-3 text-[12px] leading-relaxed">
              <p className="font-semibold">{order.customer_name}</p>
              <p className="text-muted">{order.customer_email}</p>
              <p className="text-muted">{order.customer_phone}</p>
              <Link
                href={`/admin/customers/${order.user_id}`}
                className="mt-2 inline-flex text-[11px] font-semibold text-violet hover:underline"
              >
                Open customer record
              </Link>
            </div>
          </section>

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
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted">Status</span>
                <Badge tone={statusTone(payment?.status ?? "pending")}>
                  {paymentStatusLabels[payment?.status ?? "pending"] ?? "Pending"}
                </Badge>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted">Provider</span>
                <span className="font-semibold capitalize">{payment?.provider ?? "manual"}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted">Method</span>
                <span className="font-semibold capitalize">
                  {(payment?.method ?? "bank transfer").replaceAll("_", " ")}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted">Amount</span>
                <span className="font-semibold">{formatIDR(payment?.amount ?? order.total)}</span>
              </div>
              {payment?.external_id ? (
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted">External ID</span>
                  <span className="max-w-[60%] truncate font-mono text-[10px]">
                    {payment.external_id}
                  </span>
                </div>
              ) : null}
              {payment?.paid_at ? (
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted">Paid at</span>
                  <span className="font-semibold">{formatDateTime(payment.paid_at)}</span>
                </div>
              ) : null}
            </div>
            {payment?.payment_url ? (
              <Link
                href={payment.payment_url}
                target="_blank"
                rel="noreferrer"
                className={`${buttonVariants({ variant: "outline", size: "sm" })} mt-3 w-full`}
              >
                Open payment page
              </Link>
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
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted">Courier</span>
                  <span className="font-semibold">{shipment.courier}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted">Service</span>
                  <span className="font-semibold">{shipment.service}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
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
                  <p className="text-[11px] text-muted">
                    Shipped {formatDateTime(shipment.shipped_at)}
                    {shipment.delivered_at
                      ? ` · delivered ${formatDateTime(shipment.delivered_at)}`
                      : ""}
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="mt-2 text-[12px] text-muted">No shipment record yet.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
