import { Filter, PackageSearch } from "lucide-react";
import Link from "next/link";

import { PageHero } from "@/components/layout/page-hero";
import { ProductFilters } from "@/components/store/product-filters";
import { ProductGrid } from "@/components/store/product-grid";
import { SortForm } from "@/components/store/sort-form";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { getCatalogFacets, getProducts, type ProductSort } from "@/lib/data/products";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Shop all products",
  description:
    "Browse laptops, desktop PCs, PC components, networking equipment, tools and accessories with live filters, stock and campaign pricing.",
};

const SORT_VALUES: ProductSort[] = [
  "featured",
  "newest",
  "price-asc",
  "price-desc",
  "rating",
  "popular",
];

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function positive(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const q = single(params.q).trim().slice(0, 120);
  const category = single(params.category);
  const brand = single(params.brand);
  const sortRaw = single(params.sort);
  const sort = (SORT_VALUES.includes(sortRaw as ProductSort) ? sortRaw : "featured") as ProductSort;
  const page = Math.max(1, Math.floor(Number(single(params.page)) || 1));
  const stockOnly = single(params.stock) === "1";

  const [result, facets] = await Promise.all([
    getProducts({
      q: q || undefined,
      categorySlug: category || undefined,
      brandSlug: brand || undefined,
      minPrice: positive(single(params.min)),
      maxPrice: positive(single(params.max)),
      inStock: stockOnly,
      sort,
      page,
      perPage: 24,
    }),
    getCatalogFacets(),
  ]);

  const activeCategory = facets.categories.find((item) => item.slug === category);
  const activeBrand = facets.brands.find((item) => item.slug === brand);

  const chips = [
    q ? { label: `“${q}”`, key: "q" } : null,
    activeCategory ? { label: activeCategory.name, key: "category" } : null,
    activeBrand ? { label: activeBrand.name, key: "brand" } : null,
    stockOnly ? { label: "In stock only", key: "stock" } : null,
  ].filter(Boolean) as Array<{ label: string; key: string }>;

  return (
    <>
      <PageHero
        eyebrow="The catalog"
        title={q ? `Results for “${q}”` : "Every part, properly documented."}
        description="Filter by category, brand, price and availability. Prices shown include live campaign pricing where a promotion applies."
        crumbs={[{ label: "Products" }]}
        aside={
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
              Products found
            </p>
            <p className="mt-1 font-display text-3xl font-bold text-neon">
              {result.total.toLocaleString("id-ID")}
            </p>
          </div>
        }
      />

      <div className="container-page py-8 lg:py-10">
        <div className="grid gap-6 lg:grid-cols-[268px_1fr] lg:items-start">
          <ProductFilters
            facets={facets}
            basePath="/products"
            current={params}
            className="lg:sticky lg:top-32"
          />

          <div className="min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
              <div>
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <Filter className="size-4 text-violet" />
                  {result.total} product{result.total === 1 ? "" : "s"}
                </p>
                <p className="mt-0.5 text-[11px] text-muted">
                  Page {result.page} of {Math.max(1, result.pageCount)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {chips.map((chip) => (
                  <Link
                    key={chip.key}
                    href={`/products${chip.key === "q" ? "" : ""}`}
                    className="inline-flex items-center gap-1 rounded-full border border-line bg-white px-3 py-1 text-[11px] font-medium text-muted transition-colors hover:border-coral/30 hover:text-coral"
                    title="Reset all filters"
                  >
                    {chip.label}
                    <span aria-hidden>×</span>
                  </Link>
                ))}
                <SortForm basePath="/products" current={params} value={sort} />
              </div>
            </div>

            {result.products.length ? (
              <ProductGrid products={result.products} className="mt-5" />
            ) : (
              <EmptyState
                className="mt-6"
                icon={<PackageSearch className="size-5" />}
                title="No products match those filters"
                description="Try a wider price range, remove a brand or category filter, or search for a different term."
                action={
                  <Link href="/products" className={buttonVariants({ variant: "primary", size: "sm" })}>
                    Reset filters
                  </Link>
                }
              />
            )}

            <Pagination
              page={result.page}
              pageCount={result.pageCount}
              basePath="/products"
              searchParams={params}
              className={cn("mt-8")}
            />
          </div>
        </div>
      </div>
    </>
  );
}
