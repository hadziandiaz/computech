import {
  AlertTriangle,
  ArrowRight,
  ChartNoAxesCombined,
  Package,
  ShoppingBag,
  TrendingUp,
  Users,
  Warehouse,
} from "lucide-react";
import Link from "next/link";

import { AdminHeader } from "@/components/admin/admin-header";
import { Badge, statusTone } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  getAdminInventory,
  getAdminStats,
  getSalesSeries,
  getSupportMessages,
  getTopProducts,
} from "@/lib/data/admin";
import { getRecentOrders } from "@/lib/data/orders";
import { orderStatusLabels } from "@/lib/constants";
import { formatCompact, formatDate, formatIDR } from "@/lib/format";

export const metadata = {
  title: "Admin overview",
};

export default async function AdminDashboardPage() {
  const [stats, series, orders, lowStock, support, topProducts] = await Promise.all([
    getAdminStats(),
    getSalesSeries(14),
    getRecentOrders(6),
    getAdminInventory(true),
    getSupportMessages(),
    getTopProducts(5),
  ]);

  const maxRevenue = Math.max(1, ...series.map((point) => point.revenue));
  const newSupport = support.filter((message) => message.status === "new").length;

  const cards = [
    {
      label: "Revenue",
      value: formatIDR(stats.revenue),
      hint: `${stats.paid_orders} paid orders`,
      icon: TrendingUp,
      href: "/admin/reports",
      tone: "text-[#18794e]",
    },
    {
      label: "Orders",
      value: stats.orders.toString(),
      hint: `${stats.pending_orders} need attention`,
      icon: ShoppingBag,
      href: "/admin/orders",
      tone: "text-violet-dark",
    },
    {
      label: "Customers",
      value: stats.customers.toString(),
      hint: `AOV ${formatCompact(stats.avg_order_value)}`,
      icon: Users,
      href: "/admin/customers",
      tone: "text-[#0e7e8f]",
    },
    {
      label: "Low stock",
      value: stats.low_stock.toString(),
      hint: `${stats.products} products total`,
      icon: Warehouse,
      href: "/admin/inventory",
      tone: "text-[#9a6500]",
    },
  ];

  return (
    <div>
      <AdminHeader
        eyebrow="Overview"
        title="Store performance"
        description="Live figures from the Supabase catalog, orders, payments and inventory. Demo seed data is labelled in the product records."
        actions={
          <>
            <Link href="/admin/products/new" className={buttonVariants({ variant: "outline", size: "sm" })}>
              <Package /> New product
            </Link>
            <Link href="/admin/orders" className={buttonVariants({ size: "sm" })}>
              Manage orders <ArrowRight />
            </Link>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="group rounded-2xl border border-line bg-white p-4 transition-colors hover:border-violet/30"
          >
            <div className="flex items-center justify-between">
              <span className="flex size-9 items-center justify-center rounded-xl bg-mist text-ink">
                <card.icon className="size-4" />
              </span>
              <ArrowRight className="size-4 text-muted opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
            <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted">
              {card.label}
            </p>
            <p className="mt-0.5 truncate font-display text-xl font-bold">{card.value}</p>
            <p className={`mt-0.5 text-[11px] ${card.tone}`}>{card.hint}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr] xl:items-start">
        <Card className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 font-display text-base font-semibold">
                <ChartNoAxesCombined className="size-4 text-violet" /> Revenue, last 14 days
              </h2>
              <p className="mt-0.5 text-xs text-muted">
                Confirmed, processing, shipped, delivered and completed orders.
              </p>
            </div>
            <Badge tone="success">{formatIDR(series.reduce((sum, point) => sum + point.revenue, 0))}</Badge>
          </div>
          <div className="mt-6 flex h-44 items-end gap-1.5">
            {series.map((point) => {
              const height = Math.max(3, Math.round((point.revenue / maxRevenue) * 100));
              return (
                <div key={point.date} className="group flex flex-1 flex-col items-center gap-1">
                  <div className="relative flex w-full flex-1 items-end">
                    <div
                      className="w-full rounded-t bg-violet/80 transition-colors group-hover:bg-violet"
                      style={{ height: `${height}%` }}
                      title={`${formatDate(point.date)} · ${formatIDR(point.revenue)} · ${point.orders} orders`}
                    />
                  </div>
                  <span className="text-[8px] text-muted">{point.date.slice(8)}</span>
                </div>
              );
            })}
            {!series.length ? (
              <p className="w-full self-center text-center text-sm text-muted">
                Sales data appears after orders are created.
              </p>
            ) : null}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
            <h2 className="font-display text-base font-semibold">Needs attention</h2>
            <Link
              href="/admin/support"
              className="text-[11px] font-semibold text-violet hover:underline"
            >
              Support inbox
            </Link>
          </div>
          <div className="divide-y divide-line">
            <Link
              href="/admin/orders?status=pending"
              className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-mist/60"
            >
              <span className="flex items-center gap-2 text-[13px]">
                <ShoppingBag className="size-4 text-[#9a6500]" /> Pending orders
              </span>
              <span className="font-display text-base font-bold">{stats.pending_orders}</span>
            </Link>
            <Link
              href="/admin/inventory"
              className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-mist/60"
            >
              <span className="flex items-center gap-2 text-[13px]">
                <AlertTriangle className="size-4 text-coral" /> Low-stock products
              </span>
              <span className="font-display text-base font-bold">{stats.low_stock}</span>
            </Link>
            <Link
              href="/admin/support"
              className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-mist/60"
            >
              <span className="flex items-center gap-2 text-[13px]">
                <Users className="size-4 text-violet" /> New support messages
              </span>
              <span className="font-display text-base font-bold">{newSupport}</span>
            </Link>
            <Link
              href="/admin/reviews"
              className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-mist/60"
            >
              <span className="flex items-center gap-2 text-[13px]">
                <Package className="size-4 text-[#0e7e8f]" /> Review moderation
              </span>
              <ArrowRight className="size-4 text-muted" />
            </Link>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr] xl:items-start">
        <Card>
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
            <div>
              <h2 className="font-display text-base font-semibold">Recent orders</h2>
              <p className="text-xs text-muted">Latest activity across the store.</p>
            </div>
            <Link href="/admin/orders" className={buttonVariants({ variant: "ghost", size: "sm" })}>
              View all <ArrowRight />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-[12px]">
              <thead className="bg-mist/60 text-[10px] uppercase tracking-[0.1em] text-muted">
                <tr>
                  <th className="px-5 py-2.5 font-semibold">Order</th>
                  <th className="px-3 py-2.5 font-semibold">Customer</th>
                  <th className="px-3 py-2.5 font-semibold">Status</th>
                  <th className="px-5 py-2.5 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-mist/50">
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-mono text-[11px] font-semibold text-violet hover:underline"
                      >
                        {order.order_number}
                      </Link>
                      <p className="text-[10px] text-muted">{formatDate(order.created_at)}</p>
                    </td>
                    <td className="max-w-[180px] truncate px-3 py-3">{order.customer_name}</td>
                    <td className="px-3 py-3">
                      <Badge tone={statusTone(order.status)}>
                        {orderStatusLabels[order.status] ?? order.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-right font-semibold">{formatIDR(order.total)}</td>
                  </tr>
                ))}
                {!orders.length ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-muted">
                      No orders yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <div className="border-b border-line px-5 py-4">
              <h2 className="font-display text-base font-semibold">Top products</h2>
              <p className="text-xs text-muted">By revenue across all order items.</p>
            </div>
            <ul className="divide-y divide-line">
              {topProducts.map((product, index) => (
                <li key={product.product_name} className="flex items-start justify-between gap-3 px-5 py-3">
                  <div className="flex min-w-0 items-start gap-2.5">
                    <span className="mt-0.5 font-mono text-[10px] text-muted">
                      {(index + 1).toString().padStart(2, "0")}
                    </span>
                    <div className="min-w-0">
                      <p className="line-clamp-1 text-[12px] font-semibold">{product.product_name}</p>
                      <p className="text-[10px] text-muted">{product.quantity} sold</p>
                    </div>
                  </div>
                  <span className="shrink-0 text-[12px] font-semibold">
                    {formatCompact(product.revenue)}
                  </span>
                </li>
              ))}
              {!topProducts.length ? (
                <li className="px-5 py-6 text-center text-[12px] text-muted">No sales yet.</li>
              ) : null}
            </ul>
          </Card>

          <Card>
            <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
              <h2 className="font-display text-base font-semibold">Low stock</h2>
              <Link href="/admin/inventory" className="text-[11px] font-semibold text-violet hover:underline">
                Manage
              </Link>
            </div>
            <ul className="divide-y divide-line">
              {lowStock.slice(0, 5).map((row) => (
                <li key={row.product_id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="line-clamp-1 text-[12px] font-semibold">{row.name}</p>
                    <p className="font-mono text-[10px] text-muted">{row.sku}</p>
                  </div>
                  <Badge tone={row.stock === 0 ? "coral" : "warning"}>{row.stock} left</Badge>
                </li>
              ))}
              {!lowStock.length ? (
                <li className="px-5 py-6 text-center text-[12px] text-muted">
                  All active products are above their threshold.
                </li>
              ) : null}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
