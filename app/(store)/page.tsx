import {
  ArrowRight,
  ArrowUpRight,
  Cpu,
  Gauge,
  ShieldCheck,
  Sparkles,
  Truck,
  Wifi,
  Wrench,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { ProductGrid } from "@/components/store/product-grid";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Price } from "@/components/ui/price";
import { SectionHeading } from "@/components/ui/section-heading";
import { getBrands } from "@/lib/data/brands";
import { getCategoryTree } from "@/lib/data/categories";
import { primaryImage } from "@/lib/data/mappers";
import {
  getBestSellers,
  getFeaturedProducts,
  getNewArrivals,
} from "@/lib/data/products";
import { getActivePromotions } from "@/lib/data/promotions";
import { formatDateRange, formatIDR } from "@/lib/format";
import { productUnitPrice } from "@/lib/pricing";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Computers, components and networking for serious setups",
  description:
    "Shop laptops, desktop PCs, PC components, networking equipment and accessories. Build a compatible PC with live pricing at COMPUTECH.",
};

const trustPoints = [
  { icon: Gauge, title: "Compatibility first", detail: "Socket, memory, clearance and power checked." },
  { icon: ShieldCheck, title: "Warranty tracked", detail: "Every order logs period and provider." },
  { icon: Truck, title: "Delivery that fits", detail: "Pick courier and estimate at checkout." },
  { icon: Wrench, title: "Real specs", detail: "Structured data for builders, not fluff." },
];

const buildChecks = [
  { label: "Processor", value: "Socket, cores, TDP" },
  { label: "Motherboard", value: "Chipset, memory, form factor" },
  { label: "Graphics", value: "Length, power, connectors" },
  { label: "Case", value: "Clearance, fan mounts" },
];

const tickerWords = [
  "LIVE STOCK",
  "PC BUILDER",
  "NETWORKING",
  "LAPTOPS",
  "COMPATIBILITY",
  "WARRANTY",
  "FAST CHECKOUT",
];

export default async function HomePage() {
  const [categories, featured, bestSellers, newArrivals, promotions, brands] =
    await Promise.all([
      getCategoryTree(),
      getFeaturedProducts(8),
      getBestSellers(4),
      getNewArrivals(4),
      getActivePromotions(),
      getBrands(),
    ]);

  const heroProduct = featured[0] ?? bestSellers[0] ?? null;
  const sideProducts = featured.slice(1, 3);
  const topCategories = categories.slice(0, 5);
  const featurePromotion =
    promotions.find((promotion) => promotion.type !== "free_shipping") ?? promotions[0] ?? null;
  const networkingCategory = categories.find((category) => category.slug === "networking");
  const toolsCategory = categories.find((category) => category.slug === "networking-tools");
  const freshDrops = (newArrivals.length ? newArrivals : bestSellers).slice(0, 4);

  return (
    <>
      {/* HERO */}
      <section className="noise-layer relative overflow-hidden bg-ink text-white">
        <div className="absolute inset-0 tech-grid opacity-70" aria-hidden />
        <div
          className="absolute -left-24 top-10 h-[420px] w-[420px] rounded-full bg-violet/30 blur-[120px]"
          aria-hidden
        />
        <div
          className="absolute -right-10 bottom-0 h-[360px] w-[360px] rounded-full bg-neon/20 blur-[120px]"
          aria-hidden
        />
        <div
          className="absolute right-[18%] top-16 hidden h-28 w-28 rotate-12 rounded-3xl border border-white/10 bg-white/5 lg:block"
          aria-hidden
        />

        <div className="container-page relative grid gap-10 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-end lg:py-20">
          <div className="anim-rise">
            <div className="flex flex-wrap items-center gap-3">
              <span className="sticker inline-flex items-center gap-2 rounded-full border border-acid/40 bg-acid px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-ink shadow-[3px_3px_0_0_rgba(255,255,255,0.15)]">
                <Sparkles className="size-3.5" /> New season drop
              </span>
              <span className="eyebrow text-neon">Tech, configured properly</span>
            </div>

            <h1 className="mt-5 font-display text-[clamp(3.2rem,8vw,6.6rem)] font-black uppercase leading-[0.88] tracking-[-0.06em]">
              Build your
              <br />
              <span className="relative inline-block text-white">
                setup.
                <span
                  className="absolute -bottom-1 left-0 -z-10 h-[0.2em] w-[92%] -rotate-1 bg-violet"
                  aria-hidden
                />
              </span>
              <br />
              <span className="text-violet">define</span>{" "}
              <span className="relative inline-block">
                perf
                <span className="absolute -bottom-1 left-0 -z-10 h-[0.22em] w-full -rotate-1 bg-acid" />
              </span>
              .
            </h1>

            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-white/65 sm:text-base">
              Laptops, desktops, components & networking — picked for performance,
              checked for compatibility, priced from live stock. No guesswork, just
              clean builds.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/products" className={cn(buttonVariants({ variant: "neon", size: "lg" }))}>
                Shop the drop <ArrowRight />
              </Link>
              <Link
                href="/pc-builder"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "border-white/25 bg-transparent text-white hover:border-white hover:bg-white/10",
                )}
              >
                <Cpu /> Open PC Builder
              </Link>
            </div>

            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-3">
              {[
                { label: "Components", value: `${featured.length + bestSellers.length}+` },
                { label: "Categories", value: `${categories.length}` },
                { label: "Brands", value: `${brands.length}` },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm"
                >
                  <dt className="text-[10px] uppercase tracking-[0.16em] text-white/40">
                    {stat.label}
                  </dt>
                  <dd className="mt-1 font-display text-2xl font-black text-white">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative grid grid-cols-2 gap-3 anim-fade">
            <span
              className="sticker-alt absolute -top-4 right-2 z-20 hidden rounded-xl border-2 border-ink bg-acid px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-ink shadow-[4px_4px_0_0_#7957ff] sm:inline-flex"
              aria-hidden
            >
              Spec checked ✓
            </span>

            <Link
              href={heroProduct ? `/products/${heroProduct.slug}` : "/products"}
              className="group relative col-span-2 overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.8)]"
            >
              <div className="relative aspect-[16/10]">
                {heroProduct && primaryImage(heroProduct) ? (
                  <Image
                    src={primaryImage(heroProduct)!}
                    alt={heroProduct.name}
                    fill
                    priority
                    sizes="(min-width: 1024px) 540px, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-white/25">
                    <Cpu className="size-20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
              </div>
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 sm:p-6">
                <div className="min-w-0">
                  <Badge tone="acid" className="font-black uppercase tracking-[0.12em]">
                    Editor&apos;s pick
                  </Badge>
                  <p className="mt-2 line-clamp-2 font-display text-xl font-black uppercase leading-tight tracking-tight text-white sm:text-2xl">
                    {heroProduct?.name ?? "Explore the COMPUTECH catalog"}
                  </p>
                  {heroProduct ? (
                    <p className="mt-1 text-xs font-semibold text-neon">
                      {heroProduct.brand?.name ?? "COMPUTECH"} ·{" "}
                      {formatIDR(heroProduct.effective_price ?? productUnitPrice(heroProduct))}
                    </p>
                  ) : null}
                </div>
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-acid text-ink shadow-[4px_4px_0_0_#111126] transition-transform group-hover:-translate-y-1 group-hover:translate-x-1">
                  <ArrowUpRight className="size-5" />
                </span>
              </div>
            </Link>

            {sideProducts.map((product, index) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5"
              >
                <div className="relative aspect-square">
                  {primaryImage(product) ? (
                    <Image
                      src={primaryImage(product)!}
                      alt={product.name}
                      fill
                      sizes="260px"
                      className="object-cover opacity-90 transition-transform duration-500 group-hover:scale-[1.05]"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/20 to-transparent" />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-3">
                  <p className="line-clamp-2 text-[12px] font-bold leading-snug text-white">
                    {product.name}
                  </p>
                  <p className="mt-1 text-[11px] font-semibold text-neon">
                    {formatIDR(product.effective_price ?? productUnitPrice(product))}
                  </p>
                </div>
                <span className="absolute left-3 top-3 rounded-md bg-white/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-white/70 backdrop-blur">
                  0{index + 1}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* ticker */}
        <div className="relative border-y border-white/10 bg-acid text-ink">
          <div className="marquee-track items-center py-2.5 text-[11px] font-black uppercase tracking-[0.22em]">
            {[0, 1].map((group) => (
              <div key={group} className="flex items-center" aria-hidden={group === 1}>
                {tickerWords.concat(tickerWords).map((word, i) => (
                  <span key={`${group}-${i}`} className="mx-5 inline-flex items-center gap-5">
                    {word}
                    <Zap className="size-3.5 fill-ink" />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="border-b border-line bg-white">
        <div className="container-page grid grid-cols-2 gap-x-6 gap-y-6 py-8 md:grid-cols-4">
          {trustPoints.map((point, i) => (
            <div key={point.title} className="flex items-start gap-3">
              <span
                className={cn(
                  "mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl border-2 border-ink text-ink shadow-[3px_3px_0_0_#111126]",
                  i % 4 === 0
                    ? "bg-violet-soft"
                    : i % 4 === 1
                      ? "bg-neon-soft"
                      : i % 4 === 2
                        ? "bg-acid"
                        : "bg-coral-soft",
                )}
              >
                <point.icon className="size-4" />
              </span>
              <div>
                <p className="text-[13px] font-bold">{point.title}</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-muted">{point.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="container-page py-14 lg:py-20">
        <SectionHeading
          eyebrow="Shop by category"
          title={
            <>
              Start with the system.
              <br />
              <span className="text-violet">Finish with the details.</span>
            </>
          }
          description="From complete machines to the cable that terminates the run — organised the way a real build comes together."
          action={
            <Link href="/categories" className={buttonVariants({ variant: "outline", size: "sm" })}>
              All categories <ArrowRight />
            </Link>
          }
        />
        <div className="mt-8 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
          {topCategories.map((category, index) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className={cn(
                "group relative overflow-hidden rounded-[26px] border-2 border-ink bg-ink shadow-[6px_6px_0_0_#7957ff] transition-transform duration-200 hover:-translate-y-1 hover:-translate-x-0.5",
                index === 0 && "sm:col-span-2 lg:col-span-2 lg:row-span-2",
              )}
            >
              <div
                className={cn(
                  "relative",
                  index === 0
                    ? "aspect-[4/3] lg:aspect-auto lg:h-full lg:min-h-[420px]"
                    : "aspect-[4/3]",
                )}
              >
                {category.image_url ? (
                  <Image
                    src={category.image_url}
                    alt={category.name}
                    fill
                    sizes={
                      index === 0
                        ? "(min-width: 1024px) 520px, 100vw"
                        : "(min-width: 1024px) 240px, 50vw"
                    }
                    className="object-cover opacity-80 transition-all duration-500 group-hover:scale-[1.04] group-hover:opacity-100"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                <span className="clip-tag mb-2 inline-block bg-acid px-3 py-1 pr-4 text-[10px] font-black uppercase tracking-[0.14em] text-ink">
                  {category.children?.length ?? 0} subs
                </span>
                <p className="font-display text-xl font-black uppercase leading-tight tracking-tight text-white sm:text-2xl">
                  {category.name}
                </p>
              </div>
              <span className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition-transform group-hover:rotate-45 group-hover:bg-acid group-hover:text-ink">
                <ArrowUpRight className="size-4" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section className="relative overflow-hidden border-y-2 border-ink bg-white py-14 lg:py-20">
        <div className="dot-grid absolute inset-0 opacity-40" aria-hidden />
        <div className="container-page relative">
          <SectionHeading
            eyebrow="Featured hardware"
            title="Parts worth building around."
            description="A rotating selection with structured specs and live stock — ready to drop into your build."
            action={
              <Link href="/products?sort=featured" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                View all <ArrowRight />
              </Link>
            }
          />
          {featured.length ? (
            <ProductGrid products={featured} className="mt-8" />
          ) : (
            <div className="mt-8 rounded-[26px] border-2 border-dashed border-ink/20 bg-mist p-10 text-center">
              <p className="font-display text-xl font-black uppercase">Catalog warming up</p>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted">
                Run the Supabase migrations in <code className="font-mono text-xs">supabase/migrations</code>{" "}
                to load products, stock and live pricing.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* PC BUILDER CTA */}
      <section className="container-page py-14 lg:py-20">
        <div className="overflow-hidden rounded-[32px] border-2 border-ink bg-ink text-white shadow-[10px_10px_0_0_#d9ff3f]">
          <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="noise-layer relative p-7 sm:p-10 lg:p-14">
              <div className="absolute inset-0 tech-grid opacity-50" aria-hidden />
              <div className="relative">
                <span className="sticker inline-flex items-center gap-2 rounded-full bg-acid px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-ink">
                  <Cpu className="size-3.5" /> PC Builder
                </span>
                <h2 className="mt-4 font-display text-4xl font-black uppercase leading-[0.95] tracking-[-0.05em] sm:text-5xl">
                  Compatible by
                  <br />
                  <span className="text-neon">construction</span>,<br />
                  not guesswork.
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/60">
                  Set budget & workload. We propose a build from live stock, then check
                  sockets, memory, GPU clearance, cooler height, power headroom and
                  connectors as you tweak parts.
                </p>
                <ul className="mt-6 grid gap-3 text-[13px] font-medium text-white/80 sm:grid-cols-2">
                  {[
                    "Socket and chipset checks",
                    "Memory type and slot limits",
                    "Case, GPU and cooler clearance",
                    "Wattage and connector headroom",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2.5">
                      <span className="flex size-5 items-center justify-center rounded-md bg-acid text-[10px] font-black text-ink">
                        ✓
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href="/pc-builder" className={cn(buttonVariants({ variant: "neon", size: "lg" }))}>
                    Build my PC <ArrowRight />
                  </Link>
                  <Link
                    href="/compare"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "lg" }),
                      "border-white/25 bg-transparent text-white hover:bg-white/10",
                    )}
                  >
                    Compare parts
                  </Link>
                </div>
              </div>
            </div>
            <div className="relative min-h-72 border-t-2 border-white/10 bg-white/[0.03] p-7 sm:p-10 lg:border-l-2 lg:border-t-0">
              <p className="eyebrow mb-4 text-neon">What we validate</p>
              <div className="space-y-3">
                {buildChecks.map((item, index) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-ink/60 px-4 py-3.5 transition-colors hover:border-acid/40"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex size-8 items-center justify-center rounded-lg bg-violet font-mono text-[11px] font-bold text-white">
                        0{index + 1}
                      </span>
                      <div>
                        <p className="text-[13px] font-bold text-white">{item.label}</p>
                        <p className="text-[11px] text-white/45">{item.value}</p>
                      </div>
                    </div>
                    <span className="text-acid">●</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROMOTIONS */}
      {promotions.length ? (
        <section className="border-y-2 border-ink bg-acid/20 py-14 lg:py-20">
          <div className="container-page">
            <SectionHeading
              eyebrow="Live campaigns"
              title="Offers with an end date."
              description="Campaign pricing is applied in the catalog and respected again at checkout."
              action={
                <Link href="/promotions" className={buttonVariants({ variant: "outline", size: "sm" })}>
                  All promotions <ArrowRight />
                </Link>
              }
            />
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {promotions.slice(0, 3).map((promotion, index) => (
                <Link
                  key={promotion.id}
                  href={`/promotions/${promotion.slug}`}
                  className={cn(
                    "group relative flex min-h-56 flex-col justify-between overflow-hidden rounded-[26px] border-2 border-ink p-5 transition-all hover:-translate-y-1 hover:-translate-x-0.5",
                    index === 0
                      ? "bg-violet text-white shadow-[6px_6px_0_0_#111126]"
                      : index === 1
                        ? "bg-white shadow-[6px_6px_0_0_#35d6ed]"
                        : "bg-ink text-white shadow-[6px_6px_0_0_#d9ff3f]",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <Badge
                      tone={index === 0 ? "acid" : index === 1 ? "violet" : "cyan"}
                      className="font-black uppercase tracking-[0.1em]"
                    >
                      {promotion.type.replaceAll("_", " ")}
                    </Badge>
                    <span
                      className={cn(
                        "sticker-alt rounded-lg px-2.5 py-1 font-mono text-[11px] font-bold",
                        index === 1 ? "bg-acid text-ink" : "bg-white/15 text-inherit",
                      )}
                    >
                      {promotion.discount_type === "percentage"
                        ? `${promotion.discount_value}% off`
                        : `${formatIDR(promotion.discount_value)} off`}
                    </span>
                  </div>
                  <div className="mt-8">
                    <h3 className="font-display text-2xl font-black uppercase leading-tight tracking-tight">
                      {promotion.name}
                    </h3>
                    <p
                      className={cn(
                        "mt-2 line-clamp-2 text-[12px] leading-relaxed",
                        index === 1 ? "text-muted" : "text-white/70",
                      )}
                    >
                      {promotion.description}
                    </p>
                    <p className="mt-3 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.08em]">
                      {formatDateRange(promotion.start_date, promotion.end_date)}
                      <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* NETWORKING + FRESH DROPS */}
      <section className="container-page py-14 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <div>
            <SectionHeading
              eyebrow="Networking"
              title={
                <>
                  Build the network,
                  <br />
                  <span className="text-violet">not just the PC.</span>
                </>
              }
              description="Routing, switching, wireless and the tools to terminate every run."
            />
            <div className="mt-6 space-y-3">
              {[
                { category: networkingCategory, icon: Wifi, fallback: "Routers, switches, access points and ONTs." },
                { category: toolsCategory, icon: Wrench, fallback: "Cable, connectors, testers and installation hardware." },
              ].map(({ category, icon: Icon, fallback }) =>
                category ? (
                  <Link
                    key={category.id}
                    href={`/categories/${category.slug}`}
                    className="group flex items-center justify-between rounded-2xl border-2 border-ink bg-white p-4 shadow-[4px_4px_0_0_#111126] transition-all hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_#7957ff]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex size-11 items-center justify-center rounded-xl bg-ink text-acid">
                        <Icon className="size-5" />
                      </span>
                      <div>
                        <p className="text-sm font-bold">{category.name}</p>
                        <p className="text-[11px] text-muted">{category.description ?? fallback}</p>
                      </div>
                    </div>
                    <ArrowUpRight className="size-4 text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-violet" />
                  </Link>
                ) : null,
              )}
            </div>
            <Link
              href="/networking"
              className={cn(buttonVariants({ variant: "dark", size: "md" }), "mt-5")}
            >
              Explore networking <ArrowRight />
            </Link>
          </div>

          <div>
            <div className="mb-4 flex items-center justify-between">
              <p className="eyebrow text-violet">Fresh arrivals</p>
              <span className="rounded-full bg-acid px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-ink">
                Just in
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3.5">
              {freshDrops.map((product) => {
                const image = primaryImage(product);
                return (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    className="group overflow-hidden rounded-2xl border-2 border-ink bg-white shadow-[4px_4px_0_0_#111126] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#35d6ed]"
                  >
                    <div className="relative aspect-[4/3] bg-mist">
                      {image ? (
                        <Image
                          src={image}
                          alt={product.name}
                          fill
                          sizes="(min-width: 1024px) 260px, 50vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        />
                      ) : null}
                    </div>
                    <div className="border-t-2 border-ink p-3.5">
                      <p className="line-clamp-2 text-[12px] font-bold leading-snug">{product.name}</p>
                      <div className="mt-2">
                        <Price value={product.effective_price ?? productUnitPrice(product)} size="sm" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* HIGHLIGHT */}
      {featurePromotion ? (
        <section className="container-page pb-14 lg:pb-20">
          <div className="noise-layer grid overflow-hidden rounded-[30px] border-2 border-ink bg-ink text-white shadow-[8px_8px_0_0_#7957ff] lg:grid-cols-[1fr_auto]">
            <div className="relative p-7 sm:p-10">
              <div className="absolute inset-0 tech-grid opacity-40" aria-hidden />
              <div className="relative">
                <p className="eyebrow text-acid">Current highlight</p>
                <h2 className="mt-2 font-display text-3xl font-black uppercase leading-tight tracking-[-0.04em] sm:text-4xl">
                  {featurePromotion.name}
                </h2>
                <p className="mt-2 max-w-xl text-sm text-white/60">{featurePromotion.description}</p>
                <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-neon">
                  Ends {formatDateRange(featurePromotion.start_date, featurePromotion.end_date)}
                </p>
              </div>
            </div>
            <div className="flex items-center border-t-2 border-white/10 p-7 lg:border-l-2 lg:border-t-0">
              <Link href={`/promotions/${featurePromotion.slug}`} className={buttonVariants({ variant: "neon", size: "lg" })}>
                Shop the campaign <ArrowRight />
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {/* BRANDS */}
      {brands.length ? (
        <section className="border-y-2 border-ink bg-white py-10">
          <div className="container-page">
            <p className="eyebrow text-center text-muted">Brands in the catalog</p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {brands.slice(0, 18).map((brand) => (
                <Link
                  key={brand.id}
                  href={`/brands/${brand.slug}`}
                  className="rounded-full border-2 border-ink bg-mist px-4 py-2 font-display text-sm font-bold tracking-wide text-ink shadow-[3px_3px_0_0_#111126] transition-all hover:-translate-y-0.5 hover:bg-acid"
                >
                  {brand.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* SUPPORT CTA */}
      <section className="container-page py-14 lg:py-20">
        <div className="noise-layer relative grid gap-6 overflow-hidden rounded-[32px] border-2 border-ink bg-violet p-7 text-white shadow-[10px_10px_0_0_#111126] sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="absolute -right-10 -top-10 size-48 rounded-full bg-neon/30 blur-3xl" aria-hidden />
          <div className="absolute bottom-0 left-10 h-2 w-40 -rotate-2 bg-acid" aria-hidden />
          <div className="relative">
            <p className="eyebrow text-acid">Need a second opinion?</p>
            <h2 className="mt-2 font-display text-3xl font-black uppercase leading-tight tracking-[-0.04em] text-white sm:text-4xl">
              Tell us the workload.
              <br />
              We&apos;ll spec the parts.
            </h2>
            <p className="mt-3 max-w-xl text-sm text-white/75">
              Send your budget, software and constraints. Support messages land in the
              admin inbox so nothing gets lost.
            </p>
          </div>
          <div className="relative flex flex-wrap gap-3">
            <Link href="/contact" className={cn(buttonVariants({ variant: "neon", size: "lg" }))}>
              Contact support
            </Link>
            <Link
              href="/faq"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "border-white/30 bg-transparent text-white hover:bg-white/10",
              )}
            >
              Read the FAQ
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
