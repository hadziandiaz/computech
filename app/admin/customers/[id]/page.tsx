import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Mail,
  Phone,
  ShieldAlert,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminHeader } from "@/components/admin/admin-header";
import { InlineButton } from "@/components/ui/action-form";
import { Badge, statusTone } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  setCustomerRoleAction,
  toggleCustomerSuspensionAction,
} from "@/lib/actions/admin/customers";
import { getAuthUser } from "@/lib/auth";
import { getAdminCustomer } from "@/lib/data/admin";
import { orderStatusLabels } from "@/lib/constants";
import { formatDate, formatDateTime, formatIDR } from "@/lib/format";
import type { UserRole } from "@/types/domain";

export const metadata = {
  title: "Customer detail",
};

const ROLES: UserRole[] = ["customer", "staff", "admin"];

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [detail, viewer] = await Promise.all([getAdminCustomer(id), getAuthUser()]);
  if (!detail.profile) notFound();

  const profile = detail.profile;
  const isAdmin = viewer?.role === "admin";
  const isSelf = viewer?.id === profile.id;
  const paidOrders = detail.orders.filter((order) =>
    ["confirmed", "processing", "shipped", "delivered", "completed"].includes(order.status),
  );
  const lifetime = paidOrders.reduce((sum, order) => sum + Number(order.total ?? 0), 0);
  const activeOrders = detail.orders.filter(
    (order) => !["cancelled", "completed", "delivered"].includes(order.status),
  );

  return (
    <div>
      <Link
        href="/admin/customers"
        className="mb-4 inline-flex items-center gap-1.5 text-[12px] font-semibold text-muted hover:text-ink"
      >
        <ArrowLeft className="size-3.5" /> Back to customers
      </Link>
      <AdminHeader
        eyebrow="People"
        title={profile.full_name ?? "Unnamed customer"}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <Badge
              tone={detail.role === "admin" ? "dark" : detail.role === "staff" ? "cyan" : "neutral"}
            >
              {detail.role}
            </Badge>
            {profile.is_suspended ? <Badge tone="coral">Suspended</Badge> : null}
            <span className="text-[11px] text-muted">
              Joined {formatDate(profile.created_at)}
            </span>
          </span>
        }
        actions={
          <>
            <a
              href={`mailto:${profile.email}`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <Mail /> Email customer
            </a>
            {isAdmin && !isSelf ? (
              <InlineButton
                action={toggleCustomerSuspensionAction.bind(null, profile.id, !profile.is_suspended)}
                variant={profile.is_suspended ? "primary" : "danger-ghost"}
                size="sm"
                confirm={
                  profile.is_suspended
                    ? "Restore this account? The customer can sign in again."
                    : "Suspend this account? The customer will be blocked at sign-in."
                }
                pendingText="Updating…"
              >
                {profile.is_suspended ? <ShieldCheck /> : <ShieldAlert />}
                {profile.is_suspended ? "Restore access" : "Suspend account"}
              </InlineButton>
            ) : null}
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-line bg-white p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted">Orders</p>
          <p className="mt-1 font-display text-2xl font-bold">{detail.orders.length}</p>
          <p className="text-[11px] text-muted">{activeOrders.length} in progress</p>
        </div>
        <div className="rounded-2xl border border-line bg-white p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted">
            Lifetime value
          </p>
          <p className="mt-1 font-display text-2xl font-bold">{formatIDR(lifetime)}</p>
          <p className="text-[11px] text-muted">{paidOrders.length} paid orders</p>
        </div>
        <div className="rounded-2xl border border-line bg-white p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted">
            Preferences
          </p>
          <p className="mt-1 text-[13px] font-semibold">
            {profile.marketing_opt_in ? "Marketing opt-in" : "No marketing"}
          </p>
          <p className="text-[11px] text-muted">
            {profile.order_updates ? "Order updates on" : "Order updates off"}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1.5fr] xl:items-start">
        <div className="space-y-6">
          <section className="rounded-2xl border border-line bg-white p-5">
            <h2 className="flex items-center gap-2 font-display text-base font-semibold">
              <UserRound className="size-4 text-violet" /> Contact
            </h2>
            <dl className="mt-3 space-y-2 text-[12px]">
              <div className="flex items-start gap-2">
                <Mail className="mt-0.5 size-3.5 shrink-0 text-muted" />
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.12em] text-muted">Email</dt>
                  <dd className="font-semibold">{profile.email}</dd>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="mt-0.5 size-3.5 shrink-0 text-muted" />
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.12em] text-muted">Phone</dt>
                  <dd className="font-semibold">{profile.phone || "Not provided"}</dd>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CalendarDays className="mt-0.5 size-3.5 shrink-0 text-muted" />
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.12em] text-muted">
                    Last updated
                  </dt>
                  <dd className="font-semibold">{formatDateTime(profile.updated_at)}</dd>
                </div>
              </div>
            </dl>
          </section>

          <section className="rounded-2xl border border-line bg-white p-5">
            <h2 className="flex items-center gap-2 font-display text-base font-semibold">
              <ShieldCheck className="size-4 text-violet" /> Permissions
            </h2>
            <p className="mt-1 text-[11px] leading-relaxed text-muted">
              Roles are checked server-side on every admin action and enforced again by Postgres row
              level security.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {ROLES.map((role) => {
                const active = detail.role === role;
                if (!isAdmin) {
                  return (
                    <Badge key={role} tone={active ? "violet" : "neutral"}>
                      {role}
                    </Badge>
                  );
                }
                if (active) {
                  return (
                    <Badge key={role} tone="violet">
                      {role} · current
                    </Badge>
                  );
                }
                return (
                  <InlineButton
                    key={role}
                    action={setCustomerRoleAction.bind(null, profile.id, role)}
                    variant="outline"
                    size="sm"
                    confirm={`Change this account role to ${role}?`}
                    pendingText="Updating…"
                  >
                    Make {role}
                  </InlineButton>
                );
              })}
            </div>
            {!isAdmin ? (
              <p className="mt-2 text-[11px] text-muted">
                Only administrators can change roles.
              </p>
            ) : null}
          </section>
        </div>

        <section className="rounded-2xl border border-line bg-white">
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
            <h2 className="font-display text-base font-semibold">Order history</h2>
            <Badge tone="neutral">{detail.orders.length} orders</Badge>
          </div>
          {detail.orders.length ? (
            <ul className="divide-y divide-line">
              {detail.orders.map((order) => (
                <li key={order.id}>
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-mist/40"
                  >
                    <div className="min-w-0">
                      <p className="font-mono text-[11px] font-semibold text-violet">
                        {order.order_number}
                      </p>
                      <p className="line-clamp-1 text-[12px]">
                        {order.items?.length
                          ? order.items.map((item) => item.product_name).join(", ")
                          : "Order"}
                      </p>
                      <p className="text-[10px] text-muted">{formatDate(order.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge tone={statusTone(order.status)}>
                        {orderStatusLabels[order.status] ?? order.status}
                      </Badge>
                      <span className="text-[12px] font-semibold">{formatIDR(order.total)}</span>
                      <ArrowRight className="size-3.5 text-muted" />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-5">
              <EmptyState
                icon={<UserRound className="size-5" />}
                title="No orders yet"
                description="This customer has not placed an order. Their saved addresses and cart are still available to them."
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
