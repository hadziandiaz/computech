import { ArrowRight, CalendarDays, PackageSearch, Tag } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHero } from "@/components/layout/page-hero";
import { ProductGrid } from "@/components/store/product-grid";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getProductById, getProductsByIds } from "@/lib/data/products";
import { getPromotionBySlug } from "@/lib/data/promotions";
import { formatDate, formatDateRange, formatIDR } from "@/lib/format";
import { applyPromotions, getActivePromotions } from "@/lib/data/promotions";
import type { Product } from "@/types/domain";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const promotion = await getPromotionBySlug(slug);
  if (!promotion) return { title: "Promotion not found" };
  return {
    title: promotion.name,
    description: promotion.description ?? "COMPUTECH campaign.",
  };
}

export default async function PromotionPage({ params }: PageProps) {
  const { slug } = await params;
  const promotion = await getPromotionBySlug(slug);
  if (!promotion) notFound();

  const now = Date.now();
  const startsAt = new Date(promotion.start_date).getTime();
  const endsAt = new Date(promotion.end_date).getTime();
  const live = promotion.is_active && startsAt <= now && endsAt >= now;
  const upcoming = promotion.is_active && startsAt > now;
  const expired = !promotion.is_active || endsAt < now;

  let products: Product[] = await getProductsByIds(promotion.product_ids);
  if (live) {
    products = applyPromotions(products, await getActivePromotions());
  }

  // Ensure every linked product is represented even if it is not an active catalog row.
  if (products.length < promotion.product_ids.length) {
    const seen = new Set(products.map((product) => product.id));
    const missing = promotion.product_ids.filter((id) => !seen.has(id)).slice(0, 12);
    const extras = (await Promise.all(missing.map((id) => getProductById(id)))).filter(
      (product): product is Product => Boolean(product),
    );
    products = [...products, ...extras];
  }

  return (
    <>
      <PageHero
        eyebrow={live ? "Live campaign" : upcoming ? "Starts soon" : "Campaign archive"}
        title={promotion.name}
        description={promotion.description}
        crumbs={[{ label: "Promotions", href: "/promotions" }, { label: promotion.name }]}
        actions={
          live ? (
            <Link href="/products" className={buttonVariants({ size: "md" })}>
              Browse the catalog <ArrowRight />
            </Link>
          ) : upcoming ? (
            <Link href="/promotions" className={buttonVariants({ variant: "outline", size: "md" })}>
              View live campaigns
            </Link>
          ) : (
            <Link href="/promotions" className={buttonVariants({ variant: "outline", size: "md" })}>
              See current offers
            </Link>
          )
        }
        aside={
          <div className="space-y-2">
            <Badge tone={live ? "success" : upcoming ? "warning" : "neutral"}>
              {live ? "Active now" : upcoming ? "Upcoming" : "Ended"}
            </Badge>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">Offer</p>
              <p className="mt-1 font-display text-2xl font-bold text-neon">
                {promotion.discount_type === "percentage"
                  ? `${promotion.discount_value}% off`
                  : `${formatIDR(promotion.discount_value)} off`}
              </p>
              <p className="mt-1 text-[11px] text-white/50">
                {formatDateRange(promotion.start_date, promotion.end_date)}
              </p>
            </div>
          </div>
        }
      />

      <div className="container-page py-10 lg:py-14">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Campaign type", value: promotion.type.replaceAll("_", " "), icon: Tag },
            { label: "Runs from", value: formatDate(promotion.start_date), icon: CalendarDays },
            { label: "Ends", value: formatDate(promotion.end_date), icon: CalendarDays },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-line bg-white p-4">
              <item.icon className="size-4 text-violet" />
              <p className="mt-2 text-[10px] uppercase tracking-[0.14em] text-muted">{item.label}</p>
              <p className="mt-0.5 text-sm font-semibold capitalize">{item.value}</p>
            </div>
          ))}
        </div>

        {promotion.min_purchase > 0 || promotion.max_discount ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {promotion.min_purchase > 0 ? (
              <Badge tone="neutral">Minimum spend {formatIDR(promotion.min_purchase)}</Badge>
            ) : null}
            {promotion.max_discount ? (
              <Badge tone="neutral">Max discount {formatIDR(promotion.max_discount)}</Badge>
            ) : null}
            <Badge tone="neutral">
              {promotion.product_ids.length} linked product{promotion.product_ids.length === 1 ? "" : "s"}
            </Badge>
          </div>
        ) : null}

        <div className="mt-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight">Products in this campaign</h2>
              <p className="mt-1 text-sm text-muted">
                {expired
                  ? "This campaign has ended, so products are shown at their current catalog price."
                  : live
                    ? "Campaign pricing below is applied automatically in the cart and rechecked at checkout."
                    : "These products are linked to the campaign, which has not started yet."}
              </p>
            </div>
          </div>

          {products.length ? (
            <ProductGrid products={products} className="mt-5" />
          ) : (
            <EmptyState
              className="mt-5"
              icon={<PackageSearch className="size-5" />}
              title="No products linked yet"
              description="The campaign exists but has no active product links. Check back after the catalog team updates it."
              action={
                <Link href="/products" className={buttonVariants({ size: "sm" })}>
                  Browse products
                </Link>
              }
            />
          )}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-mist/60 p-5">
          <p className="text-sm text-muted">
            Campaign terms can change. The order total shown at checkout is authoritative.
          </p>
          <Link href="/promotions" className={buttonVariants({ variant: "outline", size: "sm" })}>
            All promotions
          </Link>
        </div>
      </div>
    </>
  );
}
