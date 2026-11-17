import { RotateCcw, SlidersHorizontal } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import type { CatalogFacets } from "@/lib/data/products";
import { cn } from "@/lib/utils";

export function ProductFilters({
  facets,
  basePath,
  current,
  className,
}: {
  facets: CatalogFacets;
  basePath: string;
  current: Record<string, string | string[] | undefined>;
  className?: string;
}) {
  const value = (key: string) => {
    const raw = current[key];
    return Array.isArray(raw) ? raw[0] ?? "" : raw ?? "";
  };

  return (
    <form
      method="get"
      action={basePath}
      className={cn("rounded-2xl border border-line bg-white p-4", className)}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-display text-sm font-semibold">
          <SlidersHorizontal className="size-4 text-violet" />
          Filters
        </h2>
        <Link
          href={basePath}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-muted hover:text-ink"
        >
          <RotateCcw className="size-3" /> Reset
        </Link>
      </div>

      {value("q") ? <input type="hidden" name="q" value={value("q")} /> : null}
      {value("sort") ? <input type="hidden" name="sort" value={value("sort")} /> : null}

      <div className="space-y-4">
        <div>
          <Label htmlFor="filter-category">Category</Label>
          <Select id="filter-category" name="category" defaultValue={value("category")}>
            <option value="">All categories</option>
            {facets.categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name} ({category.count})
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="filter-brand">Brand</Label>
          <Select id="filter-brand" name="brand" defaultValue={value("brand")}>
            <option value="">All brands</option>
            {facets.brands.map((brand) => (
              <option key={brand.id} value={brand.slug}>
                {brand.name} ({brand.count})
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label>Price range (IDR)</Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              name="min"
              min={0}
              step={10000}
              placeholder={facets.minPrice ? String(facets.minPrice) : "Min"}
              defaultValue={value("min")}
              aria-label="Minimum price"
              className="h-10"
            />
            <span className="text-muted">–</span>
            <Input
              type="number"
              name="max"
              min={0}
              step={10000}
              placeholder={facets.maxPrice ? String(facets.maxPrice) : "Max"}
              defaultValue={value("max")}
              aria-label="Maximum price"
              className="h-10"
            />
          </div>
        </div>

        <label className="flex items-center gap-2.5 text-[13px] font-medium text-ink">
          <input
            type="checkbox"
            name="stock"
            value="1"
            defaultChecked={value("stock") === "1"}
            className="size-4 rounded border-line accent-[#7957FF]"
          />
          In stock only
        </label>

        <button type="submit" className={cn(buttonVariants({ size: "sm" }), "w-full")}>
          Apply filters
        </button>
        <p className="text-center text-[11px] text-muted">
          {facets.categories.reduce((sum, category) => sum + category.count, 0)} active products
        </p>
      </div>
    </form>
  );
}
