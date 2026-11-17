import { ArrowRight, PackageSearch } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHero } from "@/components/layout/page-hero";
import { ProductGrid } from "@/components/store/product-grid";
import { SortForm } from "@/components/store/sort-form";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { getBrandBySlug } from "@/lib/data/brands";
import { getProducts, type ProductSort } from "@/lib/data/products";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const SORTS: ProductSort[] = ["featured", "newest", "price-asc", "price-desc", "rating", "popular"];

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);
  if (!brand) return { title: "Brand not found" };
  return {
    title: `${brand.name} products`,
    description: brand.description ?? `Shop ${brand.name} hardware at COMPUTECH.`,
  };
}

export default async function BrandPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const brand = await getBrandBySlug(slug);
  if (!brand) notFound();

  const sortRaw = single(query.sort);
  const sort = (SORTS.includes(sortRaw as ProductSort) ? sortRaw : "featured") as ProductSort;
  const page = Math.max(1, Math.floor(Number(single(query.page)) || 1));

  const result = await getProducts({
    brandSlug: brand.slug,
    sort,
    page,
    perPage: 24,
    inStock: single(query.stock) === "1",
  });

  return (
    <>
      <PageHero
        eyebrow="Brand"
        title={brand.name}
        description={brand.description ?? `Every ${brand.name} product currently listed at COMPUTECH.`}
        crumbs={[{ label: "Brands", href: "/brands" }, { label: brand.name }]}
        aside={
          <div className="flex size-24 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] font-display text-3xl font-bold text-white lg:size-28">
            {brand.name.slice(0, 2).toUpperCase()}
          </div>
        }
      />

      <div className="container-page py-8 lg:py-10">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <p className="text-sm font-semibold">
            {result.total} product{result.total === 1 ? "" : "s"} from {brand.name}
          </p>
          <div className="flex items-center gap-2">
            <Link
              href={`/brands/${brand.slug}${single(query.stock) === "1" ? "" : "?stock=1"}`}
              className={buttonVariants({
                variant: single(query.stock) === "1" ? "primary" : "outline",
                size: "sm",
              })}
            >
              In stock only
            </Link>
            <SortForm basePath={`/brands/${brand.slug}`} current={query} value={sort} />
          </div>
        </div>

        {result.products.length ? (
          <ProductGrid products={result.products} className="mt-5" />
        ) : (
          <EmptyState
            className="mt-6"
            icon={<PackageSearch className="size-5" />}
            title={`No ${brand.name} products available`}
            description="This brand has no active products matching the current filters. Browse the catalog for alternatives."
            action={
              <Link href="/products" className={buttonVariants({ variant: "primary", size: "sm" })}>
                Browse products
              </Link>
            }
          />
        )}

        <Pagination
          page={result.page}
          pageCount={result.pageCount}
          basePath={`/brands/${brand.slug}`}
          searchParams={query}
          className="mt-8"
        />

        <div className="mt-10 flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-white p-5">
          <p className="text-sm font-semibold">Prefer a different brand?</p>
          <Link href="/brands" className="inline-flex items-center gap-1 text-[12px] font-semibold text-violet">
            See all brands <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </>
  );
}
