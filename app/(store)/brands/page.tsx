import { ArrowRight, BadgeCheck } from "lucide-react";
import Link from "next/link";

import { PageHero } from "@/components/layout/page-hero";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { getBrands } from "@/lib/data/brands";
import { getCatalogFacets } from "@/lib/data/products";

export const metadata = {
  title: "Brands",
  description:
    "Shop hardware from the brands stocked by COMPUTECH across computing, components and networking.",
};

export default async function BrandsPage() {
  const [brands, facets] = await Promise.all([getBrands(), getCatalogFacets()]);
  const counts = new Map(facets.brands.map((facet) => [facet.slug, facet.count]));

  return (
    <>
      <PageHero
        eyebrow="Hardware partners"
        title="Brands with stock you can inspect."
        description="Every brand page is generated from the live catalog. Product counts reflect active products, not marketing claims."
        crumbs={[{ label: "Brands" }]}
        aside={
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">Brands listed</p>
            <p className="mt-1 font-display text-3xl font-bold text-neon">{brands.length}</p>
          </div>
        }
      />

      <div className="container-page py-10 lg:py-14">
        {brands.length ? (
          <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {brands.map((brand) => {
              const count = counts.get(brand.slug) ?? 0;
              return (
                <Link
                  key={brand.id}
                  href={`/brands/${brand.slug}`}
                  className="group flex flex-col justify-between rounded-2xl border border-line bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-violet/30 hover:shadow-[0_18px_40px_-30px_rgba(17,17,38,0.4)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex size-12 items-center justify-center rounded-xl bg-ink font-display text-lg font-bold text-white">
                      {brand.name.slice(0, 2).toUpperCase()}
                    </span>
                    <Badge tone={count > 0 ? "violet" : "neutral"}>{count} products</Badge>
                  </div>
                  <div className="mt-6">
                    <p className="flex items-center gap-1.5 font-display text-lg font-semibold tracking-tight">
                      {brand.name}
                      <BadgeCheck className="size-4 text-violet" />
                    </p>
                    <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-muted">
                      {brand.description ?? "Catalog partner."}
                    </p>
                    <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-violet">
                      Shop brand <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-line bg-white p-12 text-center">
            <h2 className="font-display text-xl font-semibold">No brands loaded</h2>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted">
              Apply the Supabase migrations to seed the brand list used across the catalog.
            </p>
          </div>
        )}

        <div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-3xl border border-line bg-mist/70 p-6 sm:flex-row sm:items-center">
          <div>
            <p className="eyebrow text-muted">Something specific?</p>
            <h2 className="mt-1 font-display text-xl font-semibold">Search the entire catalog.</h2>
            <p className="mt-1 text-sm text-muted">
              Brand pages are convenient, but filters find the part faster.
            </p>
          </div>
          <Link href="/products" className={buttonVariants({ size: "md" })}>
            Open all products <ArrowRight />
          </Link>
        </div>
      </div>
    </>
  );
}
