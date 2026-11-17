import { ArrowRight, CalendarDays, Tag } from "lucide-react";
import Link from "next/link";

import { PageHero } from "@/components/layout/page-hero";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getActivePromotions } from "@/lib/data/promotions";
import { formatDateRange, formatIDR } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Promotions",
  description:
    "Live COMPUTECH campaigns, flash sales and product discounts. Campaign pricing is applied at checkout.",
};

export default async function PromotionsPage() {
  const promotions = await getActivePromotions();

  return (
    <>
      <PageHero
        eyebrow="Live campaigns"
        title="Offers with an end date."
        description="Every campaign below is active right now. Campaign pricing is calculated in the catalog and recalculated by the database when an order is placed."
        crumbs={[{ label: "Promotions" }]}
        aside={
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">Active campaigns</p>
            <p className="mt-1 font-display text-3xl font-bold text-neon">{promotions.length}</p>
          </div>
        }
      />

      <div className="container-page py-10 lg:py-14">
        {promotions.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {promotions.map((promotion, index) => (
              <Link
                key={promotion.id}
                href={`/promotions/${promotion.slug}`}
                className={cn(
                  "group relative flex min-h-64 flex-col justify-between overflow-hidden rounded-3xl border p-6 transition-transform hover:-translate-y-0.5",
                  index === 0
                    ? "border-violet/20 bg-violet-soft"
                    : index === 1
                      ? "border-neon/30 bg-neon-soft"
                      : index === 2
                        ? "border-coral/20 bg-coral-soft"
                        : "border-line bg-white",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <Badge tone={index === 0 ? "violet" : index === 1 ? "cyan" : index === 2 ? "coral" : "neutral"}>
                    {promotion.type.replaceAll("_", " ")}
                  </Badge>
                  <span className="rounded-full bg-white/70 px-2.5 py-1 font-mono text-[10px] font-semibold">
                    {promotion.discount_type === "percentage"
                      ? `${promotion.discount_value}% off`
                      : `${formatIDR(promotion.discount_value)} off`}
                  </span>
                </div>
                <div className="mt-6">
                  <h2 className="font-display text-2xl font-bold leading-tight tracking-tight">
                    {promotion.name}
                  </h2>
                  <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-muted">
                    {promotion.description}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="size-3.5" />
                      {formatDateRange(promotion.start_date, promotion.end_date)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Tag className="size-3.5" />
                      {promotion.product_ids.length} product{promotion.product_ids.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  <span className="mt-4 inline-flex items-center gap-1 text-[12px] font-semibold text-ink">
                    Shop campaign
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Tag className="size-5" />}
            title="No live campaigns right now"
            description="Promotions appear here automatically when a campaign start date passes and its end date is in the future. Browse the catalog in the meantime."
            action={
              <Link href="/products" className={buttonVariants({ size: "sm" })}>
                Browse products
              </Link>
            }
          />
        )}

        <div className="mt-10 grid gap-4 rounded-3xl border border-line bg-white p-6 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <p className="eyebrow text-muted">Never miss a drop</p>
            <h2 className="mt-1 font-display text-xl font-semibold">Vouchers stack on top of campaigns.</h2>
            <p className="mt-1 max-w-xl text-sm text-muted">
              Available voucher codes are listed at checkout and validated against your cart subtotal
              before the order total is finalised.
            </p>
          </div>
          <Link href="/cart" className={buttonVariants({ variant: "outline", size: "md" })}>
            Review your cart
          </Link>
        </div>
      </div>
    </>
  );
}
