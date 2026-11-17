import { ArrowRight, Search, Users } from "lucide-react";
import Link from "next/link";

import { AdminHeader } from "@/components/admin/admin-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { getAdminCustomers } from "@/lib/data/admin";
import { formatDate, formatIDR } from "@/lib/format";

export const metadata = {
  title: "Customers",
};

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const q = single(params.q).trim().toLowerCase();
  const customers = await getAdminCustomers();

  const rows = q
    ? customers.filter(
        (customer) =>
          (customer.full_name ?? "").toLowerCase().includes(q) ||
          customer.email.toLowerCase().includes(q) ||
          (customer.phone ?? "").toLowerCase().includes(q),
      )
    : customers;

  const totals = customers.reduce(
    (acc, customer) => {
      acc.value += customer.lifetime_value;
      if (customer.role !== "customer") acc.team += 1;
      if (customer.is_suspended) acc.suspended += 1;
      return acc;
    },
    { value: 0, team: 0, suspended: 0 },
  );

  return (
    <div>
      <AdminHeader
        eyebrow="People"
        title="Customers"
        description="Profiles, roles and lifetime value. Administrator and staff roles are enforced server-side and mirrored by row-level security."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-line bg-white p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted">
            Accounts
          </p>
          <p className="mt-1 font-display text-2xl font-bold">{customers.length}</p>
          <p className="text-[11px] text-muted">Registered profiles</p>
        </div>
        <div className="rounded-2xl border border-line bg-white p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted">
            Lifetime value
          </p>
          <p className="mt-1 font-display text-2xl font-bold">{formatIDR(totals.value)}</p>
          <p className="text-[11px] text-muted">Confirmed and delivered orders</p>
        </div>
        <div className="rounded-2xl border border-line bg-white p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted">
            Admin &amp; staff
          </p>
          <p className="mt-1 font-display text-2xl font-bold">{totals.team}</p>
          <p className="text-[11px] text-muted">
            {totals.suspended} suspended account{totals.suspended === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      <section className="mt-6 rounded-2xl border border-line bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-4">
          <h2 className="flex items-center gap-2 font-display text-base font-semibold">
            <Users className="size-4 text-violet" /> All accounts
          </h2>
          <form method="get" className="flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
              <Input
                name="q"
                defaultValue={q}
                placeholder="Name, email or phone…"
                className="h-9 w-60 pl-9 text-[12px]"
              />
            </div>
            <button type="submit" className={buttonVariants({ variant: "outline", size: "sm" })}>
              Search
            </button>
          </form>
        </div>

        {rows.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-[12px]">
              <thead className="bg-mist/70 text-[10px] uppercase tracking-[0.1em] text-muted">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Customer</th>
                  <th className="px-3 py-2.5 font-semibold">Role</th>
                  <th className="px-3 py-2.5 font-semibold">Orders</th>
                  <th className="px-3 py-2.5 font-semibold">Lifetime value</th>
                  <th className="px-3 py-2.5 font-semibold">Joined</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Open</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((customer) => (
                  <tr key={customer.id} className="hover:bg-mist/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-ink text-[10px] font-bold text-white">
                          {(customer.full_name ?? customer.email)
                            .slice(0, 2)
                            .toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-semibold">
                            {customer.full_name ?? "Unnamed customer"}
                          </p>
                          <p className="truncate text-[10px] text-muted">{customer.email}</p>
                        </div>
                        {customer.is_suspended ? <Badge tone="coral">Suspended</Badge> : null}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <Badge
                        tone={
                          customer.role === "admin"
                            ? "dark"
                            : customer.role === "staff"
                              ? "cyan"
                              : "neutral"
                        }
                      >
                        {customer.role}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 text-muted">{customer.order_count}</td>
                    <td className="px-3 py-3 font-semibold">
                      {formatIDR(customer.lifetime_value)}
                    </td>
                    <td className="px-3 py-3 text-muted">{formatDate(customer.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/customers/${customer.id}`}
                        className={buttonVariants({ variant: "outline", size: "sm" })}
                      >
                        Manage <ArrowRight />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-5">
            <EmptyState
              icon={<Users className="size-5" />}
              title="No customers match"
              description="Customer profiles are created automatically on registration."
            />
          </div>
        )}
      </section>
    </div>
  );
}
