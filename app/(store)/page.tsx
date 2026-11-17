import {
  AlertTriangle,
  ArrowRight,
  Cpu,
  Gauge,
  ShieldCheck,
  Sparkles,
  Truck,
  Wifi,
  Wrench,
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
  { icon: Gauge, title: "Compatibility first", detail: "Socket, memory, clearance and power checks before you buy." },
  { icon: ShieldCheck, title: "Warranty tracked", detail: "Every order records the warranty period and provider." },
  { icon: Truck, title: "Shipping that fits", detail: "Choose a courier service and see delivery estimates at checkout." },
  { icon: Wrench, title: "Technical catalog", detail: "Specifications structured for builders, not marketing pages." },
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
  const featurePromotion = promotions.find((promotion) => promotion.type !== "free_shipping");
  const networkingCategory = categories.find((category) => category.slug === "networking");
  const toolsCategory = categories.find((category) => category.slug === "networking-tools");

  return (
    <>
      <section className="relative overflow-hidden bg-ink text-white">
        <div className="absolute inset-0 tech-grid opacity-70" aria-hidden />
        <div
          className="absolute -right-24 top-0 h-[520px] w-[520px] rounded-full bg-violet/20 blur-[120px]"
          aria-hidden
        />
        <div className="container-page relative grid gap-10 py-14 lg:grid-cols-[1.04fr_0.96fr] lg:items-center lg:py-20">
          <div className="anim-rise">
            <p className="eyebrow flex items-center gap-2 text-neon">
              <Sparkles className="size-3.5" />
              Technology, configured properly
            </p>
            <h1 className="display-xl mt-4 text-white">
              BUILD YOUR
              <br />
              SETUP.
              <span className="ml-3 inline-block text-violet">/</span>
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-white/65 sm:text-base">
              Laptops, desktop systems, components and networking equipment — selected for
              performance, checked for compatibility, and backed by a catalog that shows the
              details that matter.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/products" className={cn(buttonVariants({ variant: "primary", size: "lg" }))}>
                Shop the catalog <ArrowRight />
              </Link>
              <Link
                href="/pc-builder"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "border-white/20 bg-transparent text-white hover:border-white/50 hover:bg-white/10",
                )}
              >
                <Cpu /> Open PC Builder
              </Link>
            </div>
            <dl className="mt-9 grid max-w-lg grid-cols-3 gap-4 border-t border-white/10 pt-6">
              <div>
                <dt className="text-[10px] uppercase tracking-[0.16em] text-white/40">Components</dt>
                <dd className="mt-1 font-display text-2xl font-bold">{featured.length + bestSellers.length}+</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.16em] text-white/40">Categories</dt>
                <dd className="mt-1 font-display text-2xl font-bold">{categories.length}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.16em] text-white/40">Brands</dt>
                <dd className="mt-1 font-display text-2xl font-bold">{brands.length}</dd>
              </div>
            </dl>
          </div>

          <div className="grid grid-cols-2 gap-3 anim-fade">
            <Link
              href={heroProduct ? `/products/${heroProduct.slug}` : "/products"}
              className="group relative col-span-2 overflow-hidden rounded-3xl border border-white/10 bg-white/5"
            >
              <div className="relative aspect-[16/9]">
                {heroProduct && primaryImage(heroProduct) ? (
                  <Image
                    src={primaryImage(heroProduct)!}
                    alt={heroProduct.name}
                    fill
                    priority
                    sizes="(min-width: 1024px) 540px, 100vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-white/30">
                    <Cpu className="size-16" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/10 to-transparent" />
              </div>
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 sm:p-5">
                <div className="min-w-0">
                  <Badge tone="violet" className="border-violet/30 bg-violet/90 text-white">
                    Editor&apos;s pick
                  </Badge>
                  <p className="mt-2 line-clamp-1 font-display text-lg font-semibold text-white">
                    {heroProduct?.name ?? "Explore the COMPUTECH catalog"}
                  </p>
                  {heroProduct ? (
                    <p className="text-xs text-white/60">
                      {heroProduct.brand?.name ?? "COMPUTECH"} · {formatIDR(heroProduct.effective_price ?? productUnitPrice(heroProduct))}
                    </p>
                  ) : null}
                </div>
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-ink">
                  <ArrowRight className="size-4" />
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
                      className="object-cover opacity-90 transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent" />
                </div>
                <div className="absolute inset-x-0 bottom-0 p-3">
                  <p className="line-clamp-2 text-[12px] font-semibold leading-snug text-white">
                    {product.name}
                  </p>
                  <p className="mt-1 text-[11px] text-neon">
                    {formatIDR(product.effective_price ?? productUnitPrice(product))}
                  </p>
                </div>
                <span className="absolute right-3 top-3 font-mono text-[10px] text-white/40">
                  0{index + 1}
                </span>
              </Link>
            ))}
            {sideProducts.length < 2 ? (
              <div className="col-span-2 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
                <p className="text-xs text-white/55">
                  Connect your Supabase project and run the seed migrations to populate the
                  live catalog.
                </p>
                <AlertTriangle className="size-4 text-neon" />
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-white">
        <div className="container-page grid grid-cols-2 gap-x-6 gap-y-6 py-7 md:grid-cols-4">
          {trustPoints.map((point) => (
            <div key={point.title} className="flex items-start gap-3">
              <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-violet-soft text-violet">
                <point.icon className="size-4" />
              </span>
              <div>
                <p className="text-[13px] font-semibold">{point.title}</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-muted">{point.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page py-14 lg:py-20">
        <SectionHeading
          eyebrow="Shop by category"
          title="Start with the system. Finish with the details."
          description="From complete machines to the cable that terminates the run — the catalog is organised the way a real build comes together."
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
                "group relative overflow-hidden rounded-2xl border border-line bg-ink",
                index === 0 && "sm:col-span-2 lg:col-span-2 lg:row-span-2",
              )}
            >
              <div className={cn("relative", index === 0 ? "aspect-[4/3] lg:aspect-auto lg:h-full lg:min-h-[420px]" : "aspect-[4/3]")}>
                {category.image_url ? (
                  <Image
                    src={category.image_url}
                    alt={category.name}
                    fill
                    sizes={index === 0 ? "(min-width: 1024px) 520px, 100vw" : "(min-width: 1024px) 240px, 50vw"}
                    className="object-cover opacity-80 transition-all duration-500 group-hover:scale-[1.03] group-hover:opacity-100"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-transparent" />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="font-display text-lg font-semibold leading-tight text-white">
                  {category.name}
                </p>
                <p className="mt-1 line-clamp-1 text-[11px] text-white/55">
                  {category.children?.length ?? 0} subcategories
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-white py-14 lg:py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="Featured hardware"
            title="Parts worth building around."
            description="A rotating selection of systems and components with structured specifications and live stock."
            action={
              <Link href="/products?sort=featured" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                View all <ArrowRight />
              </Link>
            }
          />
          {featured.length ? (
            <ProductGrid products={featured} className="mt-8" />
          ) : (
            <div className="mt-8 rounded-2xl border border-dashed border-line bg-mist p-10 text-center">
              <p className="font-display text-lg font-semibold">The catalog is ready for data.</p>
              <p className="mx-auto mt-1 max-w-md text-sm text-muted">
                Apply the Supabase migrations in <code className="font-mono text-xs">supabase/migrations</code> to load the demo
                catalog and enable live pricing, stock and filtering.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="container-page py-14 lg:py-20">
        <div className="overflow-hidden rounded-3xl bg-ink text-white">
          <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="relative p-7 sm:p-10 lg:p-14">
              <div className="absolute inset-0 tech-grid opacity-60" aria-hidden />
              <div className="relative">
                <p className="eyebrow text-neon">PC Builder</p>
                <h2 className="display-lg mt-3 max-w-lg text-white">
                  Compatible by construction, not by guesswork.
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/60">
                  Set a budget and a workload. COMPUTECH proposes a build from live stock, then
                  checks sockets, memory generation, GPU clearance, cooler height, power headroom
                  and connectors as you change parts.
                </p>
                <ul className="mt-6 grid gap-3 text-[13px] text-white/75 sm:grid-cols-2">
                  {[
                    "Socket and chipset checks",
                    "Memory type and slot limits",
                    "Case, GPU and cooler clearance",
                    "Wattage and connector headroom",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-neon" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href="/pc-builder" className={cn(buttonVariants({ size: "lg" }))}>
                    Build my PC <ArrowRight />
                  </Link>
                  <Link
                    href="/compare"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "lg" }),
                      "border-white/20 bg-transparent text-white hover:bg-white/10",
                    )}
                  >
                    Compare parts
                  </Link>
                </div>
              </div>
            </div>
            <div className="relative min-h-72 border-t border-white/10 bg-white/[0.03] p-7 sm:p-10 lg:border-l lg:border-t-0">
              <div className="space-y-3">
                {[
                  { label: "Processor", value: "Socket, cores, TDP" },
                  { label: "Motherboard", value: "Chipset, memory, form factor" },
                  { label: "Graphics", value: "Length, power, connectors" },
                  { label: "Case", value: "Clearance, fan mounts" },
                ].map((item, index) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-ink/50 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[10px] text-neon">0{index + 1}</span>
                      <div>
                        <p className="text-[13px] font-semibold text-white">{item.label}</p>
                        <p className="text-[11px] text-white/45">{item.value}</p>
                      </div>
                    </div>
                    <span className="flex size-7 items-center justify-center rounded-full bg-white/10 text-[10px] text-white/60">
                      ✓
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {promotions.length ? (
        <section className="border-y border-line bg-white py-14 lg:py-20">
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
                    "group relative flex min-h-52 flex-col justify-between overflow-hidden rounded-2xl border p-5 transition-transform hover:-translate-y-0.5",
                    index === 0
                      ? "border-violet/20 bg-violet-soft"
                      : index === 1
                        ? "border-neon/30 bg-neon-soft"
                        : "border-line bg-mist",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <Badge tone={index === 0 ? "violet" : index === 1 ? "cyan" : "neutral"}>
                      {promotion.type.replaceAll("_", " ")}
                    </Badge>
                    <span className="font-mono text-[10px] text-muted">
                      {promotion.discount_type === "percentage"
                        ? `${promotion.discount_value}% off`
                        : `${formatIDR(promotion.discount_value)} off`}
                    </span>
                  </div>
                  <div className="mt-8">
                    <h3 className="font-display text-xl font-bold leading-tight tracking-tight">
                      {promotion.name}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-[12px] leading-relaxed text-muted">
                      {promotion.description}
                    </p>
                    <p className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-ink">
                      {formatDateRange(promotion.start_date, promotion.end_date)}
                      <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="container-page py-14 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <div>
            <SectionHeading
              eyebrow="Networking"
              title="Build the network, not just the PC."
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
                    className="group flex items-center justify-between rounded-2xl border border-line bg-white p-4 transition-colors hover:border-violet/30"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex size-10 items-center justify-center rounded-xl bg-ink text-white">
                        <Icon className="size-4" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold">{category.name}</p>
                        <p className="text-[11px] text-muted">{category.description ?? fallback}</p>
                      </div>
                    </div>
                    <ArrowRight className="size-4 text-muted transition-transform group-hover:translate-x-0.5" />
                  </Link>
                ) : null,
              )}
            </div>
            <Link
              href="/networking"
              className={cn(buttonVariants({ variant: "dark", size: "md" }), "mt-4")}
            >
              Explore networking <ArrowRight />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3.5">
            {(newArrivals.length ? newArrivals : bestSellers).slice(0, 4).map((product) => {
              const image = primaryImage(product);
              return (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group overflow-hidden rounded-2xl border border-line bg-white"
                >
                  <div className="relative aspect-[4/3] bg-mist">
                    {image ? (
                      <Image
                        src={image}
                        alt={product.name}
                        fill
                        sizes="(min-width: 1024px) 260px, 50vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    ) : null}
                  </div>
                  <div className="p-3.5">
                    <p className="line-clamp-2 text-[12px] font-semibold leading-snug">{product.name}</p>
                    <div className="mt-2">
                      <Price value={product.effective_price ?? productUnitPrice(product)} size="sm" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {featurePromotion ? (
        <section className="container-page pb-14 lg:pb-20">
          <div className="grid overflow-hidden rounded-3xl border border-line bg-white lg:grid-cols-[1fr_auto]">
            <div className="p-7 sm:p-10">
              <p className="eyebrow text-violet">Current highlight</p>
              <h2 className="display-md mt-2 max-w-xl">{featurePromotion.name}</h2>
              <p className="mt-2 max-w-xl text-sm text-muted">{featurePromotion.description}</p>
              <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                Ends {formatDateRange(featurePromotion.start_date, featurePromotion.end_date)}
              </p>
            </div>
            <div className="flex items-center border-t border-line bg-mist/60 p-7 lg:border-l lg:border-t-0">
              <Link href={`/promotions/${featurePromotion.slug}`} className={buttonVariants({ size: "lg" })}>
                Shop the campaign <ArrowRight />
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {brands.length ? (
        <section className="border-t border-line bg-white py-10">
          <div className="container-page">
            <p className="eyebrow text-center text-muted">Hardware partners in the catalog</p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
              {brands.slice(0, 18).map((brand) => (
                <Link
                  key={brand.id}
                  href={`/brands/${brand.slug}`}
                  className="font-display text-sm font-semibold tracking-wide text-muted/80 transition-colors hover:text-ink"
                >
                  {brand.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="container-page py-14">
        <div className="grid gap-4 rounded-3xl bg-violet p-7 text-white sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="eyebrow text-white/70">Need a second opinion?</p>
            <h2 className="display-md mt-2 max-w-2xl text-white">
              Tell us the workload. We will help you choose the parts.
            </h2>
            <p className="mt-2 max-w-xl text-sm text-white/70">
              Send the team your budget, software and constraints. Support messages are stored in
              the admin inbox so nothing gets lost.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/contact"
              className={cn(buttonVariants({ variant: "dark", size: "lg" }), "bg-ink")}
            >
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
