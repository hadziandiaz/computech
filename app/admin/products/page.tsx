import { Archive, ArrowRight, ImageIcon, Pencil, Plus, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { AdminHeader } from "@/components/admin/admin-header";
import { InlineButton } from "@/components/ui/action-form";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input, Select } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { archiveProductAction } from "@/lib/actions/admin/catalog";
import { getAdminProducts, type ProductSort } from "@/lib/data/products";
import { primaryImage } from "@/lib/data/mappers";
import { formatIDR } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Products",
};

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "draft", label: "Draft" },
  { key: "out_of_stock", label: "Out of stock" },
  { key: "archived", label: "Archived" },
] as const;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const q = single(params.q).trim();
  const status = single(params.status) || "all";
  const page = Math.max(1, Math.floor(Number(single(params.page)) || 1));
  const sortRaw = single(params.sort);
  const sort = (["featured", "newest", "price-asc", "price-desc", "rating", "popular"] as ProductSort[]).includes(
    sortRaw as ProductSort,
  )
    ? (sortRaw as ProductSort)
    : "newest";

  const result = await getAdminProducts({
    q: q || undefined,
    status: status as "all" | "active" | "draft" | "out_of_stock" | "archived",
    page,
    perPage: 20,
    sort,
  });

  return (
    <div>
      <AdminHeader
        eyebrow="Catalog"
        title="Products"
        description="Create and maintain the full catalog. Stock edits here update the inventory record directly."
        actions={
          <Link href="/admin/products/new" className={buttonVariants({ size: "sm" })}>
            <Plus /> New product
          </Link>
        }
      />

      <div className="rounded-2xl border border-line bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-4">
          <div className="flex gap-1 overflow-x-auto no-scrollbar">
            {STATUS_TABS.map((tab) => (
              <Link
                key={tab.key}
                href={
                  tab.key === "all"
                    ? "/admin/products"
                    : `/admin/products?status=${tab.key}${q ? `&q=${encodeURIComponent(q)}` : ""}`
                }
                className={cn(
                  "shrink-0 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-colors",
                  status === tab.key
                    ? "bg-violet-soft text-violet-dark"
                    : "text-muted hover:bg-mist hover:text-ink",
                )}
              >
                {tab.label}
              </Link>
            ))}
          </div>
          <form method="get" className="flex flex-wrap items-center gap-2">
            <input type="hidden" name="status" value={status} />
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
              <Input
                name="q"
                defaultValue={q}
                placeholder="Search name, SKU…"
                className="h-9 w-56 pl-9 text-[12px]"
              />
            </div>
            <Select name="sort" defaultValue={sort} className="h-9 w-40 text-[12px]">
              <option value="newest">Newest</option>
              <option value="featured">Featured first</option>
              <option value="price-asc">Price low to high</option>
              <option value="price-desc">Price high to low</option>
              <option value="popular">Best selling</option>
            </Select>
            <button type="submit" className={buttonVariants({ variant: "outline", size: "sm" })}>
              Apply
            </button>
          </form>
        </div>

        {result.products.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-[12px]">
              <thead className="bg-mist/70 text-[10px] uppercase tracking-[0.1em] text-muted">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Product</th>
                  <th className="px-3 py-2.5 font-semibold">Category</th>
                  <th className="px-3 py-2.5 font-semibold">Price</th>
                  <th className="px-3 py-2.5 font-semibold">Stock</th>
                  <th className="px-3 py-2.5 font-semibold">Status</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {result.products.map((product) => {
                  const image = primaryImage(product);
                  const stock = product.inventory?.stock ?? 0;
                  return (
                    <tr key={product.id} className="hover:bg-mist/40">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="relative size-10 shrink-0 overflow-hidden rounded-lg border border-line bg-mist">
                            {image ? (
                              <Image
                                src={image}
                                alt={product.name}
                                fill
                                sizes="40px"
                                className="object-cover"
                              />
                            ) : (
                              <span className="flex h-full items-center justify-center text-muted">
                                <ImageIcon className="size-4" />
                              </span>
                            )}
                          </span>
                          <div className="min-w-0">
                            <Link
                              href={`/admin/products/${product.id}`}
                              className="line-clamp-1 font-semibold hover:text-violet-dark"
                            >
                              {product.name}
                            </Link>
                            <p className="font-mono text-[10px] text-muted">{product.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-muted">{product.category?.name ?? "—"}</td>
                      <td className="px-3 py-3">
                        <p className="font-semibold">{formatIDR(product.price)}</p>
                        {product.discount_price ? (
                          <p className="text-[10px] text-coral">
                            Discount {formatIDR(product.discount_price)}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-3 py-3">
                        <Badge
                          tone={
                            stock === 0
                              ? "coral"
                              : stock <= (product.inventory?.low_stock_threshold ?? 0)
                                ? "warning"
                                : "success"
                          }
                        >
                          {stock}
                        </Badge>
                      </td>
                      <td className="px-3 py-3">
                        <Badge tone={product.status === "active" ? "success" : product.status === "archived" ? "neutral" : "warning"}>
                          {product.status.replaceAll("_", " ")}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/products/${product.id}`}
                            className={buttonVariants({ variant: "outline", size: "sm" })}
                          >
                            <Pencil /> Edit
                          </Link>
                          {product.status !== "archived" ? (
                            <InlineButton
                              action={archiveProductAction.bind(null, product.id)}
                              variant="ghost"
                              size="sm"
                              confirm={`Archive ${product.name}? It will disappear from the storefront.`}
                              pendingText="Archiving…"
                            >
                              <Archive />
                            </InlineButton>
                          ) : (
                            <Link
                              href={`/admin/products/${product.id}`}
                              className={buttonVariants({ variant: "ghost", size: "sm" })}
                            >
                              Restore <ArrowRight />
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-5">
            <EmptyState
              icon={<ImageIcon className="size-5" />}
              title="No products match"
              description="Adjust the search or status filter, or create the first product in this catalog."
              action={
                <Link href="/admin/products/new" className={buttonVariants({ size: "sm" })}>
                  <Plus /> New product
                </Link>
              }
            />
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3">
          <p className="text-[11px] text-muted">
            {result.total} product{result.total === 1 ? "" : "s"} · page {result.page} of{" "}
            {Math.max(1, result.pageCount)}
          </p>
          <Pagination
            page={result.page}
            pageCount={result.pageCount}
            basePath="/admin/products"
            searchParams={params}
          />
        </div>
      </div>
    </div>
  );
}
