import { ArrowRight, Clock3, Ticket, TicketPercent } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getAuthUser } from "@/lib/auth";
import { getAvailableVouchers, getVoucherRedemptions } from "@/lib/data/vouchers";
import { daysUntil, formatDate, formatIDR } from "@/lib/format";

export const metadata = {
  title: "My vouchers",
};

export default async function AccountVouchersPage() {
  const user = await getAuthUser();
  if (!user) return null;

  const [vouchers, redemptions] = await Promise.all([
    getAvailableVouchers(),
    getVoucherRedemptions(user.id),
  ]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-violet">Savings</p>
          <h1 className="mt-1 flex items-center gap-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
            <TicketPercent className="size-6 text-violet" /> My vouchers
          </h1>
          <p className="mt-1 text-sm text-muted">
            Voucher validation and discount calculation run on the server at checkout.
          </p>
        </div>
        <Link href="/cart" className={buttonVariants({ variant: "outline", size: "sm" })}>
          Go to cart <ArrowRight />
        </Link>
      </header>

      <section className="space-y-3">
        <h2 className="font-display text-base font-semibold">Available now</h2>
        {vouchers.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {vouchers.map((voucher) => (
              <article
                key={voucher.id}
                className="relative overflow-hidden rounded-2xl border border-line bg-white"
              >
                <div className="absolute inset-y-0 left-0 w-1.5 bg-violet" aria-hidden />
                <div className="p-5 pl-6">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-mono text-lg font-bold tracking-wide text-violet-dark">
                        {voucher.code}
                      </p>
                      <p className="mt-0.5 text-[13px] font-semibold">{voucher.name}</p>
                    </div>
                    <Badge tone="violet">
                      {voucher.discount_type === "percentage"
                        ? `${voucher.discount_value}% off`
                        : `${formatIDR(voucher.discount_value)} off`}
                    </Badge>
                  </div>
                  {voucher.description ? (
                    <p className="mt-2 line-clamp-2 text-[12px] leading-relaxed text-muted">
                      {voucher.description}
                    </p>
                  ) : null}
                  <dl className="mt-3 space-y-1 text-[11px] text-muted">
                    <div className="flex justify-between gap-3">
                      <dt>Minimum purchase</dt>
                      <dd className="font-semibold text-ink">
                        {voucher.min_purchase > 0 ? formatIDR(voucher.min_purchase) : "None"}
                      </dd>
                    </div>
                    {voucher.max_discount ? (
                      <div className="flex justify-between gap-3">
                        <dt>Maximum discount</dt>
                        <dd className="font-semibold text-ink">{formatIDR(voucher.max_discount)}</dd>
                      </div>
                    ) : null}
                    <div className="flex justify-between gap-3">
                      <dt className="flex items-center gap-1">
                        <Clock3 className="size-3" /> Expires
                      </dt>
                      <dd className="font-semibold text-ink">
                        {voucher.expires_at
                          ? `${formatDate(voucher.expires_at)} (${daysUntil(voucher.expires_at)}d)`
                          : "No expiry"}
                      </dd>
                    </div>
                  </dl>
                  <Link
                    href="/cart"
                    className={`${buttonVariants({ variant: "soft", size: "sm" })} mt-4`}
                  >
                    <Ticket /> Apply at checkout
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Ticket className="size-5" />}
            title="No vouchers available"
            description="Public vouchers appear here when a campaign is active. Promotion pricing applies automatically to eligible products."
          />
        )}
      </section>

      <Card>
        <div className="border-b border-line px-5 py-4">
          <h2 className="font-display text-base font-semibold">Redemption history</h2>
          <p className="text-xs text-muted">Vouchers already used on your orders.</p>
        </div>
        {redemptions.length ? (
          <ul className="divide-y divide-line">
            {redemptions.map((redemption) => (
              <li
                key={redemption.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
              >
                <div>
                  <p className="font-mono text-[12px] font-semibold">
                    {redemption.voucher?.code ?? redemption.voucher_id.slice(0, 8)}
                  </p>
                  <p className="text-[11px] text-muted">
                    {redemption.voucher?.name ?? "Voucher"} · {formatDate(redemption.created_at)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[13px] font-semibold text-[#18794e]">
                    −{formatIDR(redemption.discount)}
                  </p>
                  <Link
                    href={`/account/orders/${redemption.order_id}`}
                    className="text-[11px] font-semibold text-violet hover:underline"
                  >
                    View order
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-5 py-8 text-center text-[13px] text-muted">
            You have not redeemed a voucher yet.
          </p>
        )}
      </Card>
    </div>
  );
}
