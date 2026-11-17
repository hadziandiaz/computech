import {
  BarChart3,
  ChartNoAxesCombined,
  Download,
  Package,
  TrendingUp,
  Users,
} from "lucide-react";

import Link from "next/link";

import { AdminHeader } from "@/components/admin/admin-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  getAdminCustomers,
  getAdminStats,
  getCategoryRevenue,
  getOrderStatusCounts,
  getSalesSeries,
  getTopProducts,
} from "@/lib/data/admin";
import { orderStatusLabels } from "@/lib/constants";
import { formatCompact, formatDate, formatIDR } from "@/lib/format";

export const metadata = {
  title: "Reports",
};

export default async function AdminReportsPage() {
  const [stats, series, topProducts, categories, statusCounts, customers] = await Promise.all([
    getAdminStats(),
    getSalesSeries(30),
    getTopProducts(8),
    getCategoryRevenue(6),
    getOrderStatusCounts(),
    getAdminCustomers(),
  ]);

  const maxRevenue = Math.max(1, ...series.map((point) => point.revenue));
  const totalRevenue = series.reduce((sum, point) => sum + point.revenue, 0);
  const totalOrders = series.reduce((sum, point) => sum + point.orders, 0);
  const topCustomers = [...customers]
    .filter((customer) => customer.lifetime_value > 0)
    .sort((a, b) => b.lifetime_value - a.lifetime_value)
    .slice(0, 6);
  const maxCategory = Math.max(1, ...categories.map((category) => category.revenue));
  const conversionHint =
    stats.customers > 0 ? Math.round((stats.paid_orders / stats.customers) * 100) : 0;

  return (
    <div>
      <AdminHeader
        eyebrow="Insights"
        title="Reports"
        description="Revenue, order mix and product performance from live Supabase tables. Figures exclude cancelled orders."
        actions={
          <Link
            href="/admin/orders"
            className="inline-flex h-9 items-center gap-2 rounded-full border border-line bg-white px-4 text-[13px] font-semibold hover:bg-mist"
          >
            <Download /> Export via orders
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Revenue (30 days)",
            value: formatIDR(totalRevenue),
            hint: `${stats.paid_orders} paid orders lifetime`,
            icon: TrendingUp,
          },
          {
            label: "Orders (30 days)",
            value: totalOrders.toString(),
            hint: `Average ${formatIDR(stats.avg_order_value)}`,
            icon: Package,
          },
          {
            label: "Customers",
            value: stats.customers.toString(),
            hint: `${conversionHint}% paid conversion`,
            icon: Users,
          },
          {
            label: "Low stock",
            value: stats.low_stock.toString(),
            hint: `${stats.products} products total`,
            icon: BarChart3,
          },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl border border-line bg-white p-4">
            <span className="flex size-9 items-center justify-center rounded-xl bg-mist text-ink">
              <card.icon className="size-4" />
            </span>
            <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted">
              {card.label}
            </p>
            <p className="mt-0.5 truncate font-display text-xl font-bold">{card.value}</p>
            <p className="text-[11px] text-muted">{card.hint}</p>
          </div>
        ))}
      </div>

      <Card className="mt-6 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 font-display text-base font-semibold">
              <ChartNoAxesCombined className="size-4 text-violet" /> Revenue trend
            </h2>
            <p className="mt-0.5 text-xs text-muted">Last 30 days, confirmed orders only.</p>
          </div>
          <Badge tone="success">{formatIDR(totalRevenue)}</Badge>
        </div>
        <div className="mt-6 flex h-52 items-end gap-1">
          {series.map((point) => {
            const height = Math.max(2, Math.round((point.revenue / maxRevenue) * 100));
            return (
              <div key={point.date} className="group flex flex-1 flex-col items-center gap-1">
                <div className="relative flex w-full flex-1 items-end">
                  <div
                    className="w-full rounded-t bg-violet/80 transition-colors group-hover:bg-violet"
                    style={{ height: `${height}%` }}
                    title={`${formatDate(point.date)} · ${formatIDR(point.revenue)} · ${point.orders} orders`}
                  />
                </div>
                <span className="hidden text-[8px] text-muted sm:block">
                  {point.date.slice(8)}
                </span>
              </div>
            );
          })}
          {!series.length ? (
            <p className="w-full self-center text-center text-sm text-muted">
              No sales data yet.
            </p>
          ) : null}
        </div>
      </Card>

      <div className="mt-6 grid gap-6 xl:grid-cols-2 xl:items-start">
        <Card>
          <div className="border-b border-line px-5 py-4">
            <h2 className="font-display text-base font-semibold">Order status mix</h2>
            <p className="text-xs text-muted">Count and value per status.</p>
          </div>
          <ul className="divide-y divide-line">
            {statusCounts.map((row) => {
              const share = stats.orders > 0 ? Math.round((row.count / stats.orders) * 100) : 0;
              return (
                <li key={row.status} className="px-5 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[12px] font-semibold">
                      {orderStatusLabels[row.status] ?? row.status}
                    </p>
                    <p className="text-[12px] font-semibold">
                      {row.count}{" "}
                      <span className="text-[10px] font-normal text-muted">({share}%)</span>
                    </p>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-mist">
                    <div className="h-full rounded-full bg-violet/70" style={{ width: `${share}%` }} />
                  </div>
                  <p className="mt-1 text-[10px] text-muted">{formatIDR(row.total)} total value</p>
                </li>
              );
            })}
            {!statusCounts.length ? (
              <li className="px-5 py-8 text-center text-[13px] text-muted">No orders yet.</li>
            ) : null}
          </ul>
        </Card>

        <Card>
          <div className="border-b border-line px-5 py-4">
            <h2 className="font-display text-base font-semibold">Revenue by category</h2>
            <p className="text-xs text-muted">From all order item snapshots.</p>
          </div>
          <ul className="divide-y divide-line">
            {categories.map((category) => {
              const share = Math.round((category.revenue / maxCategory) * 100);
              return (
                <li key={category.category} className="px-5 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="line-clamp-1 text-[12px] font-semibold">{category.category}</p>
                    <p className="shrink-0 text-[12px] font-semibold">
                      {formatCompact(category.revenue)}
                    </p>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-mist">
                    <div className="h-full rounded-full bg-neon" style={{ width: `${share}%` }} />
                  </div>
                  <p className="mt-1 text-[10px] text-muted">{category.quantity} units sold</p>
                </li>
              );
            })}
            {!categories.length ? (
              <li className="px-5 py-8 text-center text-[13px] text-muted">
                Category revenue appears after order items exist.
              </li>
            ) : null}
          </ul>
        </Card>

        <Card>
          <div className="border-b border-line px-5 py-4">
            <h2 className="font-display text-base font-semibold">Top products</h2>
            <p className="text-xs text-muted">Sorted by revenue.</p>
          </div>
          <ul className="divide-y divide-line">
            {topProducts.map((product, index) => (
              <li
                key={product.product_name}
                className="flex items-start justify-between gap-3 px-5 py-3"
              >
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
              <li className="px-5 py-8 text-center text-[13px] text-muted">No sales yet.</li>
            ) : null}
          </ul>
        </Card>

        <Card>
          <div className="border-b border-line px-5 py-4">
            <h2 className="font-display text-base font-semibold">Top customers</h2>
            <p className="text-xs text-muted">Lifetime value on paid orders.</p>
          </div>
          <ul className="divide-y divide-line">
            {topCustomers.map((customer, index) => (
              <li key={customer.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="font-mono text-[10px] text-muted">
                    {(index + 1).toString().padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <p className="line-clamp-1 text-[12px] font-semibold">
                      {customer.full_name ?? "Unnamed customer"}
                    </p>
                    <p className="line-clamp-1 text-[10px] text-muted">{customer.email}</p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[12px] font-semibold">{formatIDR(customer.lifetime_value)}</p>
                  <p className="text-[10px] text-muted">{customer.order_count} orders</p>
                </div>
              </li>
            ))}
            {!topCustomers.length ? (
              <li className="px-5 py-8 text-center text-[13px] text-muted">
                Customer value appears after paid orders.
              </li>
            ) : null}
          </ul>
        </Card>
      </div>
    </div>
  );
}
