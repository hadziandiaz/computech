import {
  Box,
  CheckCircle2,
  ChevronRight,
  CircuitBoard,
  Cpu,
  PackageCheck,
  ShieldCheck,
  Truck,
  Wrench,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductGallery } from "@/components/store/product-gallery";
import { ProductGrid } from "@/components/store/product-grid";
import { ProductPurchase } from "@/components/store/product-purchase";
import { ProductReviewForm } from "@/components/store/product-review-form";
import { Badge, statusTone } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { buttonVariants } from "@/components/ui/button";
import { Price } from "@/components/ui/price";
import { Rating } from "@/components/ui/rating";
import { SectionHeading } from "@/components/ui/section-heading";
import { submitReviewAction } from "@/lib/actions/orders";
import { getAuthUser } from "@/lib/auth";
import { pcComponentLabels } from "@/lib/constants";
import { inStock, primaryImage, stockOf } from "@/lib/data/mappers";
import { getProductBySlug, getRelatedProducts } from "@/lib/data/products";
import { getProductReviews } from "@/lib/data/reviews";
import { formatDate, formatIDR } from "@/lib/format";
import { productUnitPrice } from "@/lib/pricing";
import { cn } from "@/lib/utils";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.meta_title || product.name,
    description:
      product.meta_description ||
      product.short_description ||
      `Buy the ${product.name} at COMPUTECH with warranty and live stock.`,
    openGraph: {
      title: product.name,
      description: product.short_description ?? undefined,
      images: primaryImage(product) ? [primaryImage(product)!] : undefined,
    },
  };
}

function specRows(product: NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>) {
  const rows: Array<{ label: string; value: string }> = [];
  const spec = product.pc_spec;
  if (!spec) return rows;
  const push = (label: string, value: string | number | null | undefined) => {
    if (value !== null && value !== undefined && value !== "") {
      rows.push({ label, value: String(value) });
    }
  };
  push("Component type", pcComponentLabels[spec.component_type] ?? spec.component_type);
  push("Socket", spec.socket);
  push("Chipset", spec.chipset);
  push("Cores", spec.cores);
  push("TDP", spec.tdp_watt ? `${spec.tdp_watt} W` : null);
  push("Memory type", spec.memory_type);
  push("Memory slots", spec.memory_slots);
  push("Max memory", spec.max_memory_gb ? `${spec.max_memory_gb} GB` : null);
  push("Form factor", spec.form_factor);
  push("M.2 slots", spec.m2_slots);
  push("SATA ports", spec.sata_ports);
  push("GPU length", spec.gpu_length_mm ? `${spec.gpu_length_mm} mm` : null);
  push("GPU power", spec.gpu_power_connectors);
  push("Recommended PSU", spec.recommended_psu_watt ? `${spec.recommended_psu_watt} W` : null);
  push("Wattage", spec.wattage ? `${spec.wattage} W` : null);
  push("Efficiency", spec.efficiency);
  push("Max GPU length", spec.max_gpu_length_mm ? `${spec.max_gpu_length_mm} mm` : null);
  push("Max cooler height", spec.max_cooler_height_mm ? `${spec.max_cooler_height_mm} mm` : null);
  push("Cooler height", spec.cooler_height_mm ? `${spec.cooler_height_mm} mm` : null);
  push("RAM capacity", spec.ram_capacity_gb ? `${spec.ram_capacity_gb} GB` : null);
  push("RAM speed", spec.ram_speed_mhz ? `${spec.ram_speed_mhz} MHz` : null);
  push("Storage interface", spec.storage_interface);
  push("Storage capacity", spec.storage_capacity_gb ? `${spec.storage_capacity_gb} GB` : null);
  return rows;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [reviews, related, user] = await Promise.all([
    getProductReviews(product.id),
    getRelatedProducts(product, 4),
    getAuthUser(),
  ]);
  const available = inStock(product);
  const stock = stockOf(product);
  const price = product.effective_price ?? productUnitPrice(product);
  const compareAt = price < product.price ? product.price : null;
  const groupedSpecs = (product.specifications ?? []).reduce<
    Record<string, Array<{ name: string; value: string }>>
  >((acc, spec) => {
    const group = spec.group_name || "Specifications";
    acc[group] = acc[group] ?? [];
    acc[group].push({ name: spec.name, value: spec.value });
    return acc;
  }, {});
  const techRows = specRows(product);
  const hasReview = Boolean(user && reviews.some((review) => review.user_id === user.id));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    description: product.short_description ?? undefined,
    brand: product.brand ? { "@type": "Brand", name: product.brand.name } : undefined,
    image: (product.images ?? []).map((image) => image.url),
    offers: {
      "@type": "Offer",
      price: price,
      priceCurrency: "IDR",
      availability: available
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
    aggregateRating:
      product.review_count > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.review_count,
          }
        : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="border-b border-line bg-white">
        <div className="container-page py-3">
          <Breadcrumbs
            items={[
              { label: "Products", href: "/products" },
              ...(product.category
                ? [{ label: product.category.name, href: `/categories/${product.category.slug}` }]
                : []),
              { label: product.name },
            ]}
          />
        </div>
      </div>

      <section className="container-page py-8 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-12">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <ProductGallery images={product.images ?? []} name={product.name} />
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                { icon: ShieldCheck, label: `${product.warranty_months}-month warranty` },
                { icon: PackageCheck, label: available ? `${stock} in stock` : "Out of stock" },
                { icon: Wrench, label: "Technical support" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col items-center gap-1.5 rounded-xl border border-line bg-white px-2 py-3 text-center"
                >
                  <item.icon className="size-4 text-violet" />
                  <span className="text-[10px] font-medium leading-tight text-muted">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {product.brand ? (
                <Link
                  href={`/brands/${product.brand.slug}`}
                  className="text-[11px] font-bold uppercase tracking-[0.12em] text-violet hover:underline"
                >
                  {product.brand.name}
                </Link>
              ) : null}
              {product.is_demo ? <Badge tone="neutral">Demo data</Badge> : null}
              {product.promotion ? <Badge tone="violet">{product.promotion.name}</Badge> : null}
              {product.pc_spec ? (
                <Badge tone="cyan">{pcComponentLabels[product.pc_spec.component_type]}</Badge>
              ) : null}
            </div>

            <h1 className="mt-2 font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              {product.name}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
              <Rating value={product.rating} count={product.review_count} size="md" />
              {product.sold_count > 0 ? (
                <span className="text-xs text-muted">{product.sold_count} sold</span>
              ) : null}
              <span className="font-mono text-[11px] text-muted">SKU {product.sku}</span>
              <Badge tone={statusTone(available ? "active" : "cancelled")}>
                {available ? "Available" : "Out of stock"}
              </Badge>
            </div>

            {product.short_description ? (
              <p className="mt-4 text-sm leading-relaxed text-muted sm:text-[15px]">
                {product.short_description}
              </p>
            ) : null}

            <div className="mt-6 rounded-2xl border border-line bg-white p-5">
              <Price value={price} compareAt={compareAt} size="xl" />
              {compareAt ? (
                <p className="mt-1 text-xs font-medium text-coral">
                  Save {formatIDR(compareAt - price)}
                </p>
              ) : null}
              <div className="mt-5">
                <ProductPurchase
                  productId={product.id}
                  stock={stock}
                  available={available}
                />
              </div>
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {[
                {
                  icon: Truck,
                  title: "Shipping options",
                  detail: "Choose a courier and service at checkout. Costs are calculated per order.",
                  href: "/shipping",
                },
                {
                  icon: ShieldCheck,
                  title: "Warranty recorded",
                  detail: `${product.warranty_months} months · ${product.warranty_type} warranty${
                    product.warranty_provider ? ` by ${product.warranty_provider}` : ""
                  }.`,
                  href: "/warranty",
                },
              ].map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group flex items-start gap-3 rounded-xl border border-line bg-white p-3.5 transition-colors hover:border-violet/30"
                >
                  <item.icon className="mt-0.5 size-4 shrink-0 text-violet" />
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold">{item.title}</p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-muted">{item.detail}</p>
                  </div>
                  <ChevronRight className="ml-auto size-3.5 shrink-0 text-muted transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>

            {techRows.length ? (
              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center gap-2 font-display text-base font-semibold">
                    <CircuitBoard className="size-4 text-violet" />
                    Technical specifications
                  </h2>
                  {product.pc_spec ? (
                    <Link
                      href={`/pc-builder?product=${product.id}`}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-violet hover:underline"
                    >
                      <Cpu className="size-3.5" /> Use in PC Builder
                    </Link>
                  ) : null}
                </div>
                <dl className="mt-3 grid gap-x-6 gap-y-0 rounded-2xl border border-line bg-white px-4 sm:grid-cols-2">
                  {techRows.map((row) => (
                    <div
                      key={row.label}
                      className="flex items-start justify-between gap-4 border-b border-line/70 py-2.5 last:border-b-0 sm:[&:nth-last-child(2)]:border-b-0"
                    >
                      <dt className="text-[12px] text-muted">{row.label}</dt>
                      <dd className="text-right text-[12px] font-semibold">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-white py-10 lg:py-14">
        <div className="container-page grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <div>
            <SectionHeading
              eyebrow="Product details"
              title="What you are buying"
              description="Specifications and descriptions are stored in the catalog so support and the PC Builder read the same data."
            />
            <div className="mt-5 space-y-5">
              {product.description ? (
                <div className="space-y-3 text-sm leading-relaxed text-ink/80">
                  {product.description.split(/\n{2,}/).map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted">
                  A detailed description has not been published for this product yet. The
                  specification table and support team remain available.
                </p>
              )}

              {Object.entries(groupedSpecs).length ? (
                <div className="space-y-5">
                  {Object.entries(groupedSpecs).map(([group, rows]) => (
                    <div key={group}>
                      <h3 className="font-display text-sm font-semibold">{group}</h3>
                      <dl className="mt-2 divide-y divide-line rounded-xl border border-line bg-white">
                        {rows.map((row) => (
                          <div key={`${group}-${row.name}`} className="flex justify-between gap-6 px-4 py-2.5">
                            <dt className="text-[12px] text-muted">{row.name}</dt>
                            <dd className="text-right text-[12px] font-medium">{row.value}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div className="rounded-2xl border border-line bg-mist/60 p-5">
            <h3 className="flex items-center gap-2 font-display text-sm font-semibold">
              <Box className="size-4 text-violet" />
              Buying notes
            </h3>
            <ul className="mt-3 space-y-2.5 text-[12px] leading-relaxed text-muted">
              {[
                "Stock is validated again when you place the order; reservations are released if payment expires.",
                "Campaign pricing is recalculated server-side before payment, never trusted from the browser.",
                "Warranty terms are copied onto your order and tracked from delivery.",
                "Compatibility checks are guidance; confirm physical clearance for modified builds.",
              ].map((note) => (
                <li key={note} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-violet" />
                  {note}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="container-page py-10 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <SectionHeading
                eyebrow="Customer reviews"
                title={`${product.review_count} review${product.review_count === 1 ? "" : "s"}`}
              />
              <Rating value={product.rating} count={product.review_count} size="md" />
            </div>
            {reviews.length ? (
              <ul className="mt-5 space-y-3">
                {reviews.map((review) => (
                  <li key={review.id} className="rounded-2xl border border-line bg-white p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="flex size-8 items-center justify-center rounded-full bg-ink text-[10px] font-bold text-white">
                          {review.reviewer_name.slice(0, 2).toUpperCase()}
                        </span>
                        <div>
                          <p className="text-[13px] font-semibold">{review.reviewer_name}</p>
                          <p className="text-[10px] text-muted">{formatDate(review.created_at)}</p>
                        </div>
                      </div>
                      <Rating value={review.rating} showValue={false} />
                    </div>
                    {review.title ? (
                      <p className="mt-3 text-[13px] font-semibold">{review.title}</p>
                    ) : null}
                    <p className="mt-1 text-[13px] leading-relaxed text-muted">{review.body}</p>
                    {review.is_demo ? (
                      <p className="mt-2 text-[10px] uppercase tracking-[0.14em] text-muted/70">
                        Demo review
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-5 rounded-2xl border border-dashed border-line bg-white p-6 text-sm text-muted">
                No approved reviews yet. If you own this product, sign in and share your experience.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-line bg-white p-5 lg:sticky lg:top-32">
            <h2 className="font-display text-base font-semibold">Write a review</h2>
            {!user ? (
              <div className="mt-3 space-y-3">
                <p className="text-sm text-muted">
                  Sign in to review products you have purchased. Reviews are moderated before
                  publication.
                </p>
                <Link
                  href={`/login?next=${encodeURIComponent(`/products/${product.slug}`)}`}
                  className={buttonVariants({ variant: "primary", size: "sm" })}
                >
                  Sign in to review
                </Link>
              </div>
            ) : hasReview ? (
              <p className="mt-3 text-sm text-muted">
                You have already submitted a review for this product. Thank you.
              </p>
            ) : (
              <div className="mt-3">
                <ProductReviewForm productId={product.id} action={submitReviewAction} />
              </div>
            )}
          </div>
        </div>
      </section>

      {related.length ? (
        <section className="border-t border-line bg-white py-10 lg:py-14">
          <div className="container-page">
            <SectionHeading
              eyebrow="You might also need"
              title="Related products"
              action={
                <Link
                  href={product.category ? `/categories/${product.category.slug}` : "/products"}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  View category <ChevronRight />
                </Link>
              }
            />
            <ProductGrid products={related} className={cn("mt-6")} />
          </div>
        </section>
      ) : null}
    </>
  );
}
