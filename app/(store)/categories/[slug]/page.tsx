import { ArrowRight, Layers, PackageSearch } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHero } from "@/components/layout/page-hero";
import { ProductGrid } from "@/components/store/product-grid";
import { SortForm } from "@/components/store/sort-form";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { getCategories, getCategoryBreadcrumb, getCategoryBySlug } from "@/lib/data/categories";
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
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Category not found" };
  return {
    title: category.name,
    description: category.description ?? `Shop ${category.name} at COMPUTECH.`,
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const sortRaw = single(query.sort);
  const sort = (SORTS.includes(sortRaw as ProductSort) ? sortRaw : "featured") as ProductSort;
  const page = Math.max(1, Math.floor(Number(single(query.page)) || 1));
  const inStock = single(query.stock) === "1";

  const [chain, all, result] = await Promise.all([
    getCategoryBreadcrumb(category),
    getCategories(),
    getProducts({
      categorySlug: category.slug,
      sort,
      page,
      perPage: 24,
      inStock,
    }),
  ]);

  const children = all.filter((item) => item.parent_id === category.id);
  const parent = category.parent_id ? all.find((item) => item.id === category.parent_id) : null;
  const siblings = parent ? all.filter((item) => item.parent_id === parent.id && item.id !== category.id) : [];

  return (
    <>
      <PageHero
        eyebrow={chain.length > 1 ? chain.slice(0, -1).map((item) => item.name).join(" / ") : "Category"}
        title={category.name}
        description={category.description}
        crumbs={[
          { label: "Categories", href: "/categories" },
          ...chain.slice(0, -1).map((item) => ({
            label: item.name,
            href: `/categories/${item.slug}`,
          })),
          { label: category.name },
        ]}
        aside={
          category.image_url ? (
            <div className="relative hidden size-40 overflow-hidden rounded-2xl border border-white/10 sm:block lg:size-52">
              <Image
                src={category.image_url}
                alt={category.name}
                fill
                sizes="208px"
                className="object-cover"
              />
            </div>
          ) : null
        }
        actions={
          <Link href={`/products?category=${category.slug}`} className={buttonVariants({ size: "md" })}>
            All filters <ArrowRight />
          </Link>
        }
      />

      <div className="container-page py-8 lg:py-10">
        {children.length ? (
          <div className="mb-6 flex flex-wrap gap-2">
            {children.map((child) => (
              <Link
                key={child.id}
                href={`/categories/${child.slug}`}
                className="rounded-full border border-line bg-white px-3.5 py-1.5 text-[12px] font-medium text-ink transition-colors hover:border-violet/40 hover:text-violet-dark"
              >
                {child.name}
              </Link>
            ))}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Layers className="size-4 text-violet" />
              {result.total} product{result.total === 1 ? "" : "s"}
            </p>
            <p className="mt-0.5 text-[11px] text-muted">
              Page {result.page} of {Math.max(1, result.pageCount)}
              {inStock ? " · in stock only" : ""}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/categories/${category.slug}${inStock ? "" : "?stock=1"}`}
              className={buttonVariants({ variant: inStock ? "primary" : "outline", size: "sm" })}
            >
              In stock only
            </Link>
            <SortForm basePath={`/categories/${category.slug}`} current={query} value={sort} />
          </div>
        </div>

        {result.products.length ? (
          <ProductGrid products={result.products} className="mt-5" />
        ) : (
          <EmptyState
            className="mt-6"
            icon={<PackageSearch className="size-5" />}
            title="No products in this category yet"
            description="The category exists, but nothing matches the current filters. Try the full catalog or check back after the next catalog update."
            action={
              <Link href="/products" className={buttonVariants({ variant: "primary", size: "sm" })}>
                Browse all products
              </Link>
            }
          />
        )}

        <Pagination
          page={result.page}
          pageCount={result.pageCount}
          basePath={`/categories/${category.slug}`}
          searchParams={query}
          className="mt-8"
        />

        {siblings.length ? (
          <div className="mt-12 rounded-2xl border border-line bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="eyebrow text-muted">Related categories</p>
                <h2 className="mt-1 font-display text-lg font-semibold">{parent?.name}</h2>
              </div>
              {parent ? (
                <Link
                  href={`/categories/${parent.slug}`}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  View parent
                </Link>
              ) : null}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {siblings.slice(0, 10).map((sibling) => (
                <Link
                  key={sibling.id}
                  href={`/categories/${sibling.slug}`}
                  className="rounded-full border border-line px-3 py-1.5 text-[12px] text-muted transition-colors hover:border-violet/40 hover:text-violet-dark"
                >
                  {sibling.name}
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap items-center gap-2 text-xs text-muted">
          <Badge tone="neutral">Category</Badge>
          {chain.map((item) => (
            <span key={item.id} className="flex items-center gap-2">
              {item.id !== category.id ? (
                <Link href={`/categories/${item.slug}`} className="hover:text-ink">
                  {item.name}
                </Link>
              ) : (
                <span className="font-semibold text-ink">{item.name}</span>
              )}
              <span aria-hidden>/</span>
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
