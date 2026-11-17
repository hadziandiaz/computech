import {
  ArrowRight,
  Bell,
  Cpu,
  Heart,
  Package,
  ShoppingBag,
  Sparkles,
  Ticket,
  Wallet,
} from "lucide-react";
import Link from "next/link";

import { Badge, statusTone } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getAuthUser } from "@/lib/auth";
import { getUnreadNotificationCount, getNotifications } from "@/lib/data/notifications";
import { getUserOrders } from "@/lib/data/orders";
import { getUserBuilds } from "@/lib/data/builds";
import { getAvailableVouchers } from "@/lib/data/vouchers";
import { getWishlistProducts } from "@/lib/data/wishlist";
import { formatDate, formatIDR } from "@/lib/format";
import { orderStatusLabels } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Account overview",
};

export default async function AccountOverviewPage() {
  const user = await getAuthUser();
  if (!user) return null;

  const [orders, builds, wishlist, notifications, unread, vouchers] = await Promise.all([
    getUserOrders(user.id),
    getUserBuilds(user.id),
    getWishlistProducts(user.id),
    getNotifications(user.id, 4),
    getUnreadNotificationCount(user.id),
    getAvailableVouchers(),
  ]);

  const activeOrders = orders.filter(
    (order) => !["cancelled", "completed", "delivered"].includes(order.status),
  );
  const paidOrders = orders.filter((order) =>
    ["confirmed", "processing", "shipped", "delivered", "completed"].includes(order.status),
  );
  const lifetimeValue = paidOrders.reduce((sum, order) => sum + Number(order.total ?? 0), 0);
  const firstName = user.profile?.full_name?.trim().split(/\s+/)[0] || "there";

  const stats = [
    {
      label: "Orders placed",
      value: orders.length.toString(),
      hint: `${activeOrders.length} active`,
      icon: ShoppingBag,
      href: "/account/orders",
    },
    {
      label: "Lifetime value",
      value: formatIDR(lifetimeValue),
      hint: `${paidOrders.length} paid orders`,
      icon: Wallet,
      href: "/account/orders",
    },
    {
      label: "Saved builds",
      value: builds.length.toString(),
      hint: "Open the PC Builder anytime",
      icon: Cpu,
      href: "/account/builds",
    },
    {
      label: "Wishlist",
      value: wishlist.length.toString(),
      hint: unread ? `${unread} unread notification${unread === 1 ? "" : "s"}` : "All caught up",
      icon: Heart,
      href: "/account/wishlist",
    },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-violet">Account</p>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Welcome back, {firstName}.
          </h1>
          <p className="mt-1 text-sm text-muted">
            Track orders, manage builds and keep your shipping details ready for checkout.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/products" className={buttonVariants({ variant: "outline", size: "sm" })}>
            Continue shopping <ArrowRight />
          </Link>
          <Link href="/pc-builder" className={buttonVariants({ size: "sm" })}>
            <Sparkles /> Open PC Builder
          </Link>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group rounded-2xl border border-line bg-white p-4 transition-colors hover:border-violet/30"
          >
            <div className="flex items-center justify-between">
              <span className="flex size-9 items-center justify-center rounded-xl bg-violet-soft text-violet">
                <stat.icon className="size-4" />
              </span>
              <ArrowRight className="size-4 text-muted opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
            <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
              {stat.label}
            </p>
            <p className="mt-0.5 truncate font-display text-xl font-bold">{stat.value}</p>
            <p className="mt-0.5 truncate text-[11px] text-muted">{stat.hint}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
            <div>
              <h2 className="font-display text-base font-semibold">Recent orders</h2>
              <p className="text-xs text-muted">Every order and its current status.</p>
            </div>
            <Link href="/account/orders" className={buttonVariants({ variant: "ghost", size: "sm" })}>
              All orders <ArrowRight />
            </Link>
          </div>
          {orders.length ? (
            <ul className="divide-y divide-line">
              {orders.slice(0, 4).map((order) => (
                <li key={order.id}>
                  <Link
                    href={`/account/orders/${order.id}`}
                    className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-mist/60"
                  >
                    <div className="min-w-0">
                      <p className="font-mono text-[11px] font-semibold text-muted">
                        {order.order_number}
                      </p>
                      <p className="mt-0.5 line-clamp-1 text-sm font-semibold">
                        {order.items?.length
                          ? order.items.map((item) => item.product_name).join(", ")
                          : "Order details"}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted">
                        {formatDate(order.created_at)} · {order.items?.length ?? 0} item
                        {(order.items?.length ?? 0) === 1 ? "" : "s"}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <Badge tone={statusTone(order.status)}>
                        {orderStatusLabels[order.status] ?? order.status}
                      </Badge>
                      <span className="text-sm font-semibold">{formatIDR(order.total)}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-5">
              <EmptyState
                icon={<Package className="size-5" />}
                title="No orders yet"
                description="Your first COMPUTECH order will appear here with live payment and shipment status."
                action={
                  <Link href="/products" className={buttonVariants({ size: "sm" })}>
                    Browse products
                  </Link>
                }
              />
            </div>
          )}
        </Card>

        <div className="space-y-6">
          <Card>
            <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
              <h2 className="flex items-center gap-2 font-display text-base font-semibold">
                <Bell className="size-4 text-violet" /> Notifications
              </h2>
              <Link
                href="/account/notifications"
                className="text-[11px] font-semibold text-violet hover:underline"
              >
                View all
              </Link>
            </div>
            {notifications.length ? (
              <ul className="divide-y divide-line">
                {notifications.map((notification) => (
                  <li key={notification.id} className="px-5 py-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[13px] font-semibold">{notification.title}</p>
                      {!notification.is_read ? (
                        <span className="mt-1 size-1.5 shrink-0 rounded-full bg-violet" />
                      ) : null}
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-muted">
                      {notification.body}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-5 py-8 text-center text-[13px] text-muted">
                No notifications yet. Order updates will arrive here.
              </p>
            )}
          </Card>

          <Card className="overflow-hidden">
            <div className="bg-ink p-5 text-white">
              <p className="eyebrow text-neon">Vouchers ready</p>
              <p className="mt-1 font-display text-2xl font-bold">
                {vouchers.length} available
              </p>
              <p className="mt-1 text-[11px] text-white/55">
                Apply a code at checkout and the server recalculates the discount.
              </p>
            </div>
            <div className="p-5">
              {vouchers.length ? (
                <div className="flex flex-wrap gap-2">
                  {vouchers.slice(0, 3).map((voucher) => (
                    <span
                      key={voucher.id}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border border-line bg-mist px-3 py-1 font-mono text-[11px] font-semibold",
                      )}
                    >
                      <Ticket className="size-3 text-violet" /> {voucher.code}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[13px] text-muted">
                  No public vouchers right now. Campaign pricing still applies automatically.
                </p>
              )}
              <Link
                href="/account/vouchers"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-4")}
              >
                My vouchers <ArrowRight />
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {wishlist.length ? (
        <Card>
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
            <h2 className="flex items-center gap-2 font-display text-base font-semibold">
              <Heart className="size-4 text-coral" /> Saved for later
            </h2>
            <Link
              href="/account/wishlist"
              className="text-[11px] font-semibold text-violet hover:underline"
            >
              Open wishlist
            </Link>
          </div>
          <div className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-3">
            {wishlist.slice(0, 3).map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="rounded-xl border border-line p-3 transition-colors hover:border-violet/30"
              >
                <p className="line-clamp-2 text-[13px] font-semibold">{product.name}</p>
                <p className="mt-1 text-[11px] text-muted">
                  {formatIDR(product.effective_price ?? product.price)}
                </p>
              </Link>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
