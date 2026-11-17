import { ArrowRight, Package, PackageSearch, RotateCcw, Wallet } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Badge, statusTone } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getAuthUser } from "@/lib/auth";
import { getUserOrders } from "@/lib/data/orders";
import { orderStatusLabels, paymentStatusLabels } from "@/lib/constants";
import { formatDate, formatIDR } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "My orders",
};

const FILTERS = [
  { key: "all", label: "All orders" },
  { key: "active", label: "In progress" },
  { key: "pending", label: "Awaiting payment" },
  { key: "shipped", label: "Shipped" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
] as const;

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export default async function AccountOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getAuthUser();
  if (!user) return null;

  const params = await searchParams;
  const status = single(params.status) || "all";
  const orders = await getUserOrders(user.id);

  const filtered = orders.filter((order) => {
    if (status === "all") return true;
    if (status === "active") {
      return !["cancelled", "completed", "delivered"].includes(order.status);
    }
    if (status === "completed") {
      return ["completed", "delivered"].includes(order.status);
    }
    return order.status === status;
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-violet">Purchases</p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">
            My orders
          </h1>
          <p className="mt-1 text-sm text-muted">
            Payment, processing and shipment updates in one place.
          </p>
        </div>
        <Link href="/track-order" className={buttonVariants({ variant: "outline", size: "sm" })}>
          <PackageSearch /> Track by number
        </Link>
      </header>

      <nav className="flex gap-1 overflow-x-auto rounded-2xl border border-line bg-white p-1.5 no-scrollbar">
        {FILTERS.map((filter) => {
          const active = status === filter.key;
          return (
            <Link
              key={filter.key}
              href={filter.key === "all" ? "/account/orders" : `/account/orders?status=${filter.key}`}
              className={cn(
                "shrink-0 rounded-xl px-3.5 py-2 text-[12px] font-semibold transition-colors",
                active ? "bg-violet-soft text-violet-dark" : "text-muted hover:bg-mist hover:text-ink",
              )}
            >
              {filter.label}
            </Link>
          );
        })}
      </nav>

      {filtered.length ? (
        <div className="space-y-3">
          {filtered.map((order) => {
            const payment = order.payment;
            const itemCount = order.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
            return (
              <article key={order.id} className="overflow-hidden rounded-2xl border border-line bg-white">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-mist/40 px-4 py-3 sm:px-5">
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                        Order
                      </p>
                      <p className="font-mono text-[12px] font-semibold">{order.order_number}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                        Placed
                      </p>
                      <p className="text-[12px] font-semibold">{formatDate(order.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                        Total
                      </p>
                      <p className="text-[12px] font-semibold">{formatIDR(order.total)}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={statusTone(order.status)}>
                      {orderStatusLabels[order.status] ?? order.status}
                    </Badge>
                    {payment ? (
                      <Badge tone={statusTone(payment.status)}>
                        {paymentStatusLabels[payment.status] ?? payment.status}
                      </Badge>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex shrink-0 -space-x-3">
                      {(order.items ?? []).slice(0, 3).map((item) => (
                        <span
                          key={item.id}
                          className="relative size-12 overflow-hidden rounded-xl border-2 border-white bg-mist"
                        >
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
                      ))}
                    </div>
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-[13px] font-semibold">
                        {(order.items ?? []).map((item) => item.product_name).join(", ") ||
                          "Order details"}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted">
                        {itemCount} item{itemCount === 1 ? "" : "s"}
                        {order.shipment?.tracking_number
                          ? ` · ${order.shipment.courier} ${order.shipment.tracking_number}`
                          : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {payment?.status === "pending" && payment.payment_url ? (
                      <Link
                        href={payment.payment_url}
                        className={buttonVariants({ size: "sm" })}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Wallet /> Pay now
                      </Link>
                    ) : null}
                    <Link
                      href={`/account/orders/${order.id}`}
                      className={buttonVariants({ variant: "outline", size: "sm" })}
                    >
                      View order <ArrowRight />
                    </Link>
                    {["completed", "delivered", "cancelled"].includes(order.status) ? (
                      <Link
                        href={`/account/orders/${order.id}#reorder`}
                        className={buttonVariants({ variant: "ghost", size: "sm" })}
                      >
                        <RotateCcw /> Reorder
                      </Link>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<Package className="size-5" />}
          title={orders.length ? "No orders in this view" : "Your order history is empty"}
          description={
            orders.length
              ? "Choose another status filter to see more orders."
              : "Once you place an order, payment and shipment updates will appear here."
          }
          action={
            <Link href="/products" className={buttonVariants({ size: "sm" })}>
              Browse products
            </Link>
          }
        />
      )}
    </div>
  );
}
