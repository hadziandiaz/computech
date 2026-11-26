"use client";

import {
  AlertTriangle,
  CheckCircle2,
  CircleHelp,
  GitCompareArrows,
  Loader2,
  ShoppingCart,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { COMPARE_EVENT, readCompareIds, writeCompareIds } from "@/components/store/compare-button";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Price } from "@/components/ui/price";
import { Rating } from "@/components/ui/rating";
import { formatIDR } from "@/lib/format";
import { checkCompatibility, type BuilderSelection } from "@/lib/pc-builder/compatibility";
import { productUnitPrice } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/domain";

type CompareProduct = Product;

const rows: Array<{
  label: string;
  value: (product: CompareProduct) => string;
}> = [
  { label: "Price", value: (p) => formatIDR(p.effective_price ?? productUnitPrice(p)) },
  { label: "Brand", value: (p) => p.brand?.name ?? "—" },
  { label: "Category", value: (p) => p.category?.name ?? "—" },
  {
    label: "Availability",
    value: (p) =>
      (p.inventory?.stock ?? 0) > 0 ? `${p.inventory?.stock} in stock` : "Out of stock",
  },
  { label: "Rating", value: (p) => (p.rating > 0 ? `${p.rating.toFixed(1)} / 5` : "No ratings yet") },
  { label: "Warranty", value: (p) => `${p.warranty_months} months · ${p.warranty_type}` },
  { label: "Component type", value: (p) => p.pc_spec?.component_type ?? "—" },
  { label: "Socket", value: (p) => p.pc_spec?.socket ?? "—" },
  { label: "Chipset", value: (p) => p.pc_spec?.chipset ?? "—" },
  { label: "Memory type", value: (p) => p.pc_spec?.memory_type ?? "—" },
  { label: "Form factor", value: (p) => p.pc_spec?.form_factor ?? "—" },
  { label: "TDP", value: (p) => (p.pc_spec?.tdp_watt ? `${p.pc_spec.tdp_watt} W` : "—") },
  { label: "Wattage", value: (p) => (p.pc_spec?.wattage ? `${p.pc_spec.wattage} W` : "—") },
  { label: "GPU length", value: (p) => (p.pc_spec?.gpu_length_mm ? `${p.pc_spec.gpu_length_mm} mm` : "—") },
  { label: "Storage interface", value: (p) => p.pc_spec?.storage_interface ?? "—" },
  {
    label: "Performance score",
    value: (p) => (p.pc_spec?.performance_score != null ? String(p.pc_spec.performance_score) : "—"),
  },
];

export function CompareClient() {
  const [ids, setIds] = useState<string[]>([]);
  const [products, setProducts] = useState<CompareProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);

  const compatibility = useMemo(() => {
    const selection: BuilderSelection = {};
    for (const product of products) {
      const type = product.pc_spec?.component_type;
      if (type && !selection[type]) selection[type] = product;
    }
    if (Object.keys(selection).length < 2) return null;
    return checkCompatibility(selection);
  }, [products]);

  useEffect(() => {
    const sync = () => setIds(readCompareIds());
    sync();
    setReady(true);
    window.addEventListener(COMPARE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(COMPARE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (!ids.length) {
      setProducts([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch(`/api/products/compare?ids=${encodeURIComponent(ids.join(","))}`)
      .then((response) => (response.ok ? response.json() : { products: [] }))
      .then((data: { products?: CompareProduct[] }) => {
        if (cancelled) return;
        const list = data.products ?? [];
        setProducts(ids.map((id) => list.find((product) => product.id === id)).filter(Boolean) as CompareProduct[]);
      })
      .catch(() => {
        if (!cancelled) setProducts([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [ids, ready]);

  function remove(id: string) {
    writeCompareIds(readCompareIds().filter((item) => item !== id));
  }

  if (!ready || loading) {
    return (
      <div className="flex min-h-64 items-center justify-center gap-2 text-sm text-muted">
        <Loader2 className="size-4 animate-spin" /> Loading comparison…
      </div>
    );
  }

  if (!products.length) {
    return (
      <EmptyState
        icon={<GitCompareArrows className="size-5" />}
        title="No products selected"
        description="Add up to four products from any catalog page to compare specifications, pricing and compatibility side by side."
        action={
          <Link href="/products" className={buttonVariants({ variant: "primary" })}>
            Browse products
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          Comparing {products.length} of 4 products. Differences in specifications are highlighted per row.
        </p>
        <div className="flex gap-2">
          <Link href="/products" className={buttonVariants({ variant: "outline", size: "sm" })}>
            Add more
          </Link>
          <Button variant="ghost" size="sm" onClick={() => writeCompareIds([])}>
            <Trash2 /> Clear all
          </Button>
        </div>
      </div>

      {compatibility ? (
        <div
          className={cn(
            "rounded-xl border border-line p-4",
            compatibility.status === "compatible"
              ? "bg-[#e9f9ef]"
              : compatibility.status === "warning"
                ? "bg-[#fff7e6]"
                : compatibility.status === "incompatible"
                  ? "bg-coral-soft"
                  : "bg-mist",
          )}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              {compatibility.status === "compatible" ? (
                <CheckCircle2 className="size-5 text-[#18794e]" />
              ) : compatibility.status === "warning" ? (
                <AlertTriangle className="size-5 text-[#9a6500]" />
              ) : compatibility.status === "incompatible" ? (
                <XCircle className="size-5 text-[#c4404b]" />
              ) : (
                <CircleHelp className="size-5 text-muted" />
              )}
              <div>
                <p className="font-display text-sm font-black uppercase tracking-tight">
                  Compatibility check
                </p>
                <p className="text-[12px] text-muted">
                  Based on the PC components currently in this comparison.
                </p>
              </div>
            </div>
            <Badge
              tone={
                (compatibility.status === "compatible"
                  ? "success"
                  : compatibility.status === "warning"
                    ? "warning"
                    : compatibility.status === "incompatible"
                      ? "coral"
                      : "neutral") as BadgeTone
              }
              className="border-transparent font-bold uppercase tracking-[0.08em]"
            >
              {compatibility.status === "compatible"
                ? "Compatible"
                : compatibility.status === "warning"
                  ? "Needs a look"
                  : compatibility.status === "incompatible"
                    ? "Incompatible"
                    : "Not enough data"}
            </Badge>
          </div>
          {compatibility.checks.length ? (
            <ul className="mt-3 grid gap-2 border-t border-ink/10 pt-3 sm:grid-cols-2">
              {compatibility.checks.map((check) => (
                <li key={check.id} className="flex items-start gap-2 text-[12px] leading-relaxed">
                  <span
                    className={cn(
                      "mt-1 size-2 shrink-0 rotate-45",
                      check.status === "compatible"
                        ? "bg-[#18794e]"
                        : check.status === "warning"
                          ? "bg-[#9a6500]"
                          : check.status === "incompatible"
                            ? "bg-coral"
                            : "bg-muted",
                    )}
                  />
                  <span>
                    <span className="font-bold">{check.label}:</span>{" "}
                    <span className="text-muted">{check.detail}</span>
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
          <Link
            href="/pc-builder"
            className={cn(buttonVariants({ variant: "dark", size: "sm" }), "mt-4")}
          >
            Check in PC Builder
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-line bg-mist/60 px-4 py-3 text-[12px] text-muted">
          Compatibility verdict appears when you compare at least two PC components.
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-line bg-white">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 w-36 border-b border-line bg-white p-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                Product
              </th>
              {products.map((product) => (
                <th key={product.id} className="min-w-48 border-b border-l border-line p-4 align-top">
                  <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-xl bg-mist">
                    {product.images?.[0]?.url ? (
                      <Image
                        src={product.images[0].url}
                        alt={product.name}
                        fill
                        sizes="240px"
                        className="object-cover"
                      />
                    ) : null}
                    <button
                      type="button"
                      onClick={() => remove(product.id)}
                      aria-label={`Remove ${product.name} from comparison`}
                      className="absolute right-1.5 top-1.5 inline-flex size-7 items-center justify-center rounded-full bg-white/95 text-muted shadow-sm hover:text-coral"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                  <Link href={`/products/${product.slug}`} className="line-clamp-2 font-semibold hover:text-violet">
                    {product.name}
                  </Link>
                  <div className="mt-1 font-mono text-[10px] font-normal text-muted">{product.sku}</div>
                  <div className="mt-2">
                    <Price value={product.effective_price ?? productUnitPrice(product)} size="sm" />
                  </div>
                  <div className="mt-1.5">
                    <Rating value={product.rating} count={product.review_count} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const values = products.map(row.value);
              const differs = new Set(values).size > 1;
              return (
                <tr key={row.label} className={cn(differs && "bg-mist/40")}>
                  <th className="sticky left-0 z-10 border-b border-line bg-inherit p-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
                    {row.label}
                  </th>
                  {products.map((product, index) => (
                    <td
                      key={product.id}
                      className={cn(
                        "border-b border-l border-line p-4 text-[13px]",
                        differs ? "font-semibold text-ink" : "text-muted",
                      )}
                    >
                      {values[index]}
                    </td>
                  ))}
                </tr>
              );
            })}
            <tr>
              <th className="sticky left-0 z-10 bg-white p-4" />
              {products.map((product) => (
                <td key={product.id} className="border-l border-line p-4">
                  <Link
                    href={`/products/${product.slug}`}
                    className={buttonVariants({ variant: "primary", size: "sm" })}
                  >
                    <ShoppingCart /> View product
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
