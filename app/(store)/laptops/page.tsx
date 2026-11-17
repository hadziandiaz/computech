import {
  ArrowRight,
  BatteryCharging,
  Cpu,
  Gauge,
  Laptop,
  Monitor,
  Weight,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { PageHero } from "@/components/layout/page-hero";
import { ProductGrid } from "@/components/store/product-grid";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { getCategories } from "@/lib/data/categories";
import { primaryImage } from "@/lib/data/mappers";
import { getProducts } from "@/lib/data/products";
import { formatIDR } from "@/lib/format";
import { productUnitPrice } from "@/lib/pricing";

export const metadata = {
  title: "Laptops",
  description:
    "Shop laptops for study, business, gaming and creation at COMPUTECH. Compare performance, displays and portability.",
};

const buyingGuide = [
  {
    icon: Cpu,
    title: "Processor",
    detail: "Match the CPU to your workload. U-series for battery, H/HX for sustained performance.",
  },
  {
    icon: Gauge,
    title: "Graphics",
    detail: "Integrated graphics handle office and media. Dedicated GPUs matter for gaming and 3D.",
  },
  {
    icon: Monitor,
    title: "Display",
    detail: "Resolution, refresh rate and colour coverage change the experience more than raw specs suggest.",
  },
  {
    icon: BatteryCharging,
    title: "Battery & power",
    detail: "A larger battery and efficient display often beat a smaller, brighter chassis in real use.",
  },
  {
    icon: Weight,
    title: "Portability",
    detail: "Check weight, charger size and port selection if the laptop travels every day.",
  },
  {
    icon: Laptop,
    title: "Upgrade path",
    detail: "Soldered memory limits future upgrades. Confirm RAM and storage slots before buying.",
  },
];

export default async function LaptopsPage() {
  const [laptops, categories] = await Promise.all([
    getProducts({ categorySlug: "laptop", sort: "featured", perPage: 12 }),
    getCategories(),
  ]);

  const laptopCategory = categories.find((category) => category.slug === "laptop");
  const parent = laptopCategory
    ? categories.find((category) => category.id === laptopCategory.parent_id)
    : null;
  const relatedSlugs = ["desktop-pc", "monitor", "accessories"];
  const related = categories.filter(
    (category) => relatedSlugs.includes(category.slug) || category.slug === "laptop",
  );
  const hero = laptops.products[0];

  return (
    <>
      <PageHero
        eyebrow="Portable systems"
        title="Laptops chosen for the work, not the sticker."
        description="Every laptop listing carries the specifications that decide whether a machine fits your day: processor class, graphics, memory, storage, display and weight."
        crumbs={[{ label: "Laptops" }]}
        actions={
          <>
            <Link href="/products?category=laptop" className={buttonVariants({ size: "md" })}>
              Shop all laptops <ArrowRight />
            </Link>
            <Link
              href="/pc-builder"
              className={buttonVariants({ variant: "outline", size: "md" })}
            >
              Prefer a desktop?
            </Link>
          </>
        }
        aside={
          hero ? (
            <Link
              href={`/products/${hero.slug}`}
              className="group relative hidden w-72 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] lg:block"
            >
              <div className="relative aspect-[4/3]">
                {primaryImage(hero) ? (
                  <Image
                    src={primaryImage(hero)!}
                    alt={hero.name}
                    fill
                    sizes="288px"
                    className="object-cover opacity-90 transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                ) : null}
              </div>
              <div className="p-3">
                <p className="line-clamp-1 text-[12px] font-semibold text-white">{hero.name}</p>
                <p className="mt-0.5 text-[11px] text-neon">
                  {formatIDR(hero.effective_price ?? productUnitPrice(hero))}
                </p>
              </div>
            </Link>
          ) : null
        }
      />

      <section className="border-b border-line bg-white">
        <div className="container-page flex flex-wrap items-center justify-between gap-4 py-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="violet">{laptops.total} laptops listed</Badge>
            {parent ? (
              <Link
                href={`/categories/${parent.slug}`}
                className="text-[12px] text-muted hover:text-ink"
              >
                Part of {parent.name}
              </Link>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {related.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="rounded-full border border-line px-3 py-1.5 text-[11px] font-medium text-muted transition-colors hover:border-violet/40 hover:text-violet-dark"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-10 lg:py-14">
        <SectionHeading
          eyebrow="Available now"
          title="Laptops in the live catalog"
          description="Campaign pricing and stock come from the database. Open a product for the full specification sheet."
          action={
            <Link
              href="/products?category=laptop&sort=newest"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Newest first
            </Link>
          }
        />
        {laptops.products.length ? (
          <ProductGrid products={laptops.products} className="mt-6" />
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-line bg-white p-10 text-center">
            <p className="font-display text-lg font-semibold">No laptops in the catalog yet</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted">
              Run the seed migrations to load demo laptops, or add products from the admin console.
            </p>
            <Link href="/products" className={buttonVariants({ size: "sm" })}>
              Browse everything
            </Link>
          </div>
        )}
      </section>

      <section className="border-y border-line bg-white py-12 lg:py-16">
        <div className="container-page">
          <SectionHeading
            eyebrow="Buying guide"
            title="Six things that decide the right laptop."
            description="Marketing names change every year. These fundamentals do not."
          />
          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {buyingGuide.map((item, index) => (
              <div key={item.title} className="rounded-2xl border border-line p-5">
                <div className="flex items-center justify-between">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-violet-soft text-violet">
                    <item.icon className="size-4" />
                  </span>
                  <span className="font-mono text-[10px] text-muted">0{index + 1}</span>
                </div>
                <h3 className="mt-3 font-display text-base font-semibold">{item.title}</h3>
                <p className="mt-1 text-[12px] leading-relaxed text-muted">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-12">
        <div className="flex flex-col items-start justify-between gap-4 rounded-3xl bg-ink p-7 text-white sm:flex-row sm:items-center sm:p-10">
          <div>
            <p className="eyebrow text-neon">Need a hand?</p>
            <h2 className="mt-2 font-display text-2xl font-bold">Tell us the software and the budget.</h2>
            <p className="mt-1 max-w-xl text-sm text-white/60">
              Support can compare two laptops for your workload and explain the trade-offs in plain
              language.
            </p>
          </div>
          <Link href="/contact" className={buttonVariants({ size: "lg" })}>
            Ask support <ArrowRight />
          </Link>
        </div>
      </section>
    </>
  );
}
