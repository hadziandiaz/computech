import {
  AlertTriangle,
  CheckCircle2,
  CircleHelp,
  Cpu,
  Share2,
  ShoppingCart,
  XCircle,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AddToCartButton } from "@/components/store/add-to-cart-button";
import { PageHero } from "@/components/layout/page-hero";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Price } from "@/components/ui/price";
import { pcComponentLabels, pcComponentOrder } from "@/lib/constants";
import { getPublicBuild } from "@/lib/data/builds";
import { stockOf } from "@/lib/data/mappers";
import { formatDate, formatIDR } from "@/lib/format";
import {
  buildTotal,
  checkCompatibility,
  type BuilderSelection,
  type PcComponent,
} from "@/lib/pc-builder/compatibility";
import type { PcBuildItem } from "@/types/domain";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const build = await getPublicBuild(slug);
  if (!build) return { title: "Build not found" };
  return {
    title: `${build.name} — a saved COMPUTECH build`,
    description: `A ${build.items?.length ?? 0}-part PC build shared from COMPUTECH with a recorded total of ${formatIDR(build.total_price)}.`,
  };
}

function compatibilityIcon(status: string) {
  if (status === "compatible") return <CheckCircle2 className="size-3.5" />;
  if (status === "warning") return <AlertTriangle className="size-3.5" />;
  if (status === "incompatible") return <XCircle className="size-3.5" />;
  return <CircleHelp className="size-3.5" />;
}

export default async function PublicBuildPage({ params }: PageProps) {
  const { slug } = await params;
  const build = await getPublicBuild(slug);
  if (!build) notFound();

  const selection: BuilderSelection = {};
  for (const item of (build.items ?? []) as PcBuildItem[]) {
    if (item.product?.pc_spec) {
      selection[item.product.pc_spec.component_type] = item.product as PcComponent;
    }
  }
  const compatibility = checkCompatibility(selection);
  const total = buildTotal(selection);

  return (
    <>
      <PageHero
        eyebrow="Shared build"
        title={build.name}
        description={
          <>
            A saved PC build with {build.items?.length ?? 0} components. Compatibility is recalculated
            from the current catalog data, not copied from when the build was saved.
          </>
        }
        crumbs={[{ label: "Builds", href: "/pc-builder" }, { label: build.name }]}
        actions={
          <>
            <Link href="/pc-builder" className={buttonVariants({ size: "lg" })}>
              <Cpu /> Open in PC Builder
            </Link>
            <Link
              href="/products"
              className={buttonVariants({
                variant: "outline",
                size: "lg",
                className: "border-white/20 bg-transparent text-white hover:border-white/50 hover:bg-white/10",
              })}
            >
              Browse parts
            </Link>
          </>
        }
        aside={
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">
              Recorded total
            </p>
            <p className="mt-1 font-display text-2xl font-bold text-neon">{formatIDR(total)}</p>
            <p className="mt-1 text-[11px] text-white/45">
              Budget {formatIDR(build.budget)} · Updated {formatDate(build.updated_at)}
            </p>
          </div>
        }
      />

      <div className="container-page py-10 lg:py-14">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
                <Share2 className="size-4 text-violet" /> Parts list
              </h2>
              <Badge tone={compatibility.status === "compatible" ? "success" : compatibility.status === "incompatible" ? "coral" : "warning"}>
                {compatibility.status === "compatible"
                  ? "Compatible"
                  : compatibility.status === "incompatible"
                    ? "Incompatible"
                    : compatibility.status === "warning"
                      ? "Review required"
                      : "Not enough data"}
              </Badge>
            </div>

            <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-white">
              <ul className="divide-y divide-line">
                {pcComponentOrder.map((type) => {
                  const selected = selection[type];
                  if (!selected) return null;
                  const stock = stockOf(selected);
                  return (
                    <li key={type} className="flex flex-wrap items-center gap-3 p-4">
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                          {pcComponentLabels[type]}
                        </p>
                        <Link
                          href={`/products/${selected.slug}`}
                          className="mt-0.5 block truncate text-[13px] font-semibold hover:text-violet"
                        >
                          {selected.name}
                        </Link>
                        <p className="mt-0.5 text-[10px] text-muted">
                          {selected.brand?.name ?? "COMPUTECH"} · {selected.sku} ·{" "}
                          {stock > 0 ? `${stock} in stock` : "Out of stock"}
                        </p>
                      </div>
                      <Price value={selected.discount_price ?? selected.price} size="sm" />
                      <AddToCartButton
                        productId={selected.id}
                        iconOnly
                        label="Add component"
                        outOfStock={stock <= 0}
                      />
                    </li>
                  );
                })}
              </ul>
            </div>

            {build.notes ? (
              <div className="mt-5 rounded-2xl border border-line bg-white p-5">
                <h2 className="font-display text-base font-semibold">Builder notes</h2>
                <p className="mt-2 whitespace-pre-line text-[13px] leading-relaxed text-muted">
                  {build.notes}
                </p>
              </div>
            ) : null}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-28">
            <div className="rounded-2xl border border-line bg-white p-5">
              <h2 className="font-display text-base font-semibold">Compatibility checks</h2>
              {compatibility.checks.length ? (
                <ul className="mt-3 space-y-2.5">
                  {compatibility.checks.map((check) => (
                    <li key={check.id} className="flex items-start gap-2">
                      <span
                        className={
                          check.status === "compatible"
                            ? "mt-0.5 text-[#18794e]"
                            : check.status === "incompatible"
                              ? "mt-0.5 text-coral"
                              : "mt-0.5 text-[#9a6500]"
                        }
                      >
                        {compatibilityIcon(check.status)}
                      </span>
                      <div>
                        <p className="text-[12px] font-semibold">{check.label}</p>
                        <p className="mt-0.5 text-[11px] leading-relaxed text-muted">{check.detail}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-[12px] text-muted">
                  Not enough components to run a compatibility check.
                </p>
              )}

              {compatibility.missing.length ? (
                <p className="mt-4 rounded-xl bg-mist px-3 py-2 text-[11px] leading-relaxed text-muted">
                  Missing: {compatibility.missing.map((type) => pcComponentLabels[type]).join(", ")}.
                </p>
              ) : null}
            </div>

            <div className="rounded-2xl bg-ink p-5 text-white">
              <h2 className="font-display text-base font-semibold">Make it yours</h2>
              <p className="mt-1 text-[12px] leading-relaxed text-white/55">
                Swap parts, check the fit and save your own version. Sign in to keep builds and add a
                whole build to the cart at once.
              </p>
              <div className="mt-4 grid gap-2">
                <Link href="/pc-builder" className={buttonVariants({ size: "sm" })}>
                  <Cpu /> Start from builder
                </Link>
                <Link
                  href="/register"
                  className={buttonVariants({
                    variant: "outline",
                    size: "sm",
                    className: "border-white/20 bg-transparent text-white hover:border-white/40 hover:bg-white/10",
                  })}
                >
                  Create an account
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-line bg-mist/60 p-4 text-[11px] leading-relaxed text-muted">
              <p className="flex items-center gap-1.5 font-semibold text-ink">
                <ShoppingCart className="size-3.5 text-violet" /> Buying note
              </p>
              <p className="mt-1.5">
                The public build page adds components individually. Saved builds added from your
                account check live stock before inserting items into the cart.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
