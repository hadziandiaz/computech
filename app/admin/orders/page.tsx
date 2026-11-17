import { ArrowRight, Banknote, Search, ShoppingBag } from "lucide-react";
import Link from "next/link";

import { AdminHeader } from "@/components/admin/admin-header";
import { Badge, statusTone } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { getAdminOrders } from "@/lib/data/orders";
import {
  orderStatusLabels,
  paymentStatusLabels,
} from "@/lib/constants";
import { formatDate, formatIDR } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types/domain";

export const metadata = {
  title: "Orders",
};

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

const STATUS_TABS: Array<{ key: OrderStatus | "all"; label: string }> = [
  { key: "all", label: "All" },
  { key: "pending", label: "Awaiting payment" },
  { key: "confirmed", label: "Confirmed" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const q = single(params.q).trim();
  const statusRaw = single(params.status);
  const status = (STATUS_TABS.find((tab) => tab.key === statusRaw)?.key ?? "all") as
    | OrderStatus
    | "all";
  const page = Math.max(1, Math.floor(Number(single(params.page)) || 1));

  const result = await getAdminOrders({ q: q || undefined, status, page, perPage: 20 });

  return (
    <div>
      <AdminHeader
        eyebrow="Operations"
        title="Orders"
        description="Every order is created by the database pricing function. Status changes here run through the staff RPC so stock and notifications stay consistent."
      />

      <div className="rounded-2xl border border-line bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-4">
          <div className="flex gap-1 overflow-x-auto no-scrollbar">
            {STATUS_TABS.map((tab) => (
              <Link
                key={tab.key}
                href={
                  tab.key === "all"
                    ? "/admin/orders"
                    : `/admin/orders?status=${tab.key}${q ? `&q=${encodeURIComponent(q)}` : ""}`
                }
                className={cn(
                  "shrink-0 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-colors",
                  status === tab.key
                    ? "bg-violet-soft text-violet-dark"
                    : "text-muted hover:bg-mist hover:text-ink",
                )}
              >
                {tab.label}
              </Link>
            ))}
          </div>
          <form method="get" className="flex items-center gap-2">
            <input type="hidden" name="status" value={status} />
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
              <Input
                name="q"
                defaultValue={q}
                placeholder="Order number, name or email…"
                className="h-9 w-64 pl-9 text-[12px]"
              />
            </div>
            <button type="submit" className={buttonVariants({ variant: "outline", size: "sm" })}>
              Search
            </button>
          </form>
        </div>

        {result.orders.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-[12px]">
              <thead className="bg-mist/70 text-[10px] uppercase tracking-[0.1em] text-muted">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Order</th>
                  <th className="px-3 py-2.5 font-semibold">Customer</th>
                  <th className="px-3 py-2.5 font-semibold">Items</th>
                  <th className="px-3 py-2.5 font-semibold">Payment</th>
                  <th className="px-3 py-2.5 font-semibold">Fulfilment</th>
                  <th className="px-3 py-2.5 font-semibold">Total</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Open</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {result.orders.map((order) => {
                  const itemCount =
                    order.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
                  return (
                    <tr key={order.id} className="hover:bg-mist/40">
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-mono text-[11px] font-semibold text-violet hover:underline"
                        >
                          {order.order_number}
                        </Link>
                        <p className="text-[10px] text-muted">{formatDate(order.created_at)}</p>
                      </td>
                      <td className="max-w-[190px] px-3 py-3">
                        <p className="truncate font-semibold">{order.customer_name}</p>
                        <p className="truncate text-[10px] text-muted">{order.customer_email}</p>
                      </td>
                      <td className="px-3 py-3 text-muted">
                        {itemCount} item{itemCount === 1 ? "" : "s"}
                      </td>
                      <td className="px-3 py-3">
                        {order.payment ? (
                          <Badge tone={statusTone(order.payment.status)}>
                            {paymentStatusLabels[order.payment.status] ?? order.payment.status}
                          </Badge>
                        ) : (
                          <span className="text-[11px] text-muted">No payment</span>
                        )}
                        <p className="mt-1 text-[10px] capitalize text-muted">
                          {order.payment?.provider ?? "manual"}
                          {order.payment?.method ? ` · ${order.payment.method.replaceAll("_", " ")}` : ""}
                        </p>
                      </td>
                      <td className="px-3 py-3">
                        <Badge tone={statusTone(order.status)}>
                          {orderStatusLabels[order.status] ?? order.status}
                        </Badge>
                        {order.shipment?.tracking_number ? (
                          <p className="mt-1 font-mono text-[10px] text-muted">
                            {order.shipment.courier} {order.shipment.tracking_number}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-3 py-3 font-semibold">{formatIDR(order.total)}</td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className={buttonVariants({ variant: "outline", size: "sm" })}
                        >
                          Manage <ArrowRight />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-5">
            <EmptyState
              icon={<ShoppingBag className="size-5" />}
              title="No orders match"
              description={
                q || status !== "all"
                  ? "Try a different search term or status filter."
                  : "Orders will appear here as soon as customers check out."
              }
            />
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3">
          <p className="flex items-center gap-1.5 text-[11px] text-muted">
            <Banknote className="size-3.5" />
            {result.total} order{result.total === 1 ? "" : "s"} · page {result.page} of{" "}
            {Math.max(1, result.pageCount)}
          </p>
          <Pagination
            page={result.page}
            pageCount={result.pageCount}
            basePath="/admin/orders"
            searchParams={params}
          />
        </div>
      </div>
    </div>
  );
}
