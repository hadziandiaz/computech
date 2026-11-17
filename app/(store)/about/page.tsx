import {
  ArrowRight,
  Boxes,
  CircuitBoard,
  Cpu,
  GitCompareArrows,
  Network,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";
import Link from "next/link";

import { PageHero } from "@/components/layout/page-hero";
import { ProductGrid } from "@/components/store/product-grid";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { getBrands } from "@/lib/data/brands";
import { getCategories } from "@/lib/data/categories";
import { getFeaturedProducts } from "@/lib/data/products";
import { getSiteSettings } from "@/lib/data/settings";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "About COMPUTECH",
  description:
    "COMPUTECH is a technology store built around structured specifications, compatibility and honest stock data for systems, components and networking.",
};

const principles = [
  {
    icon: CircuitBoard,
    title: "Specifications before slogans",
    detail:
      "Every product record carries the fields that decide whether a build works: socket, memory generation, slots, clearance, wattage and connectors.",
  },
  {
    icon: GitCompareArrows,
    title: "Decisions made comparable",
    detail:
      "Filtering, comparison and the PC Builder all read the same catalog, so the numbers you compare are the numbers you buy.",
  },
  {
    icon: ShieldCheck,
    title: "Warranty is part of the order",
    detail:
      "Warranty duration, type and provider are copied onto each order line so support can answer without guessing.",
  },
  {
    icon: Network,
    title: "Beyond the desktop",
    detail:
      "Routing, switching, wireless and the tools to terminate the run — networking is treated as a first-class category.",
  },
];

const ranges = [
  { icon: Cpu, label: "Desktop PCs & laptops", href: "/laptops" },
  { icon: Boxes, label: "PC components", href: "/products?category=components" },
  { icon: Network, label: "Networking equipment", href: "/networking" },
  { icon: Wrench, label: "Tools, cable & accessories", href: "/products" },
];

export default async function AboutPage() {
  const [settings, categories, brands, featured] = await Promise.all([
    getSiteSettings(),
    getCategories(),
    getBrands(),
    getFeaturedProducts(4),
  ]);

  const roots = categories.filter((category) => !category.parent_id);
  const demoCount = categories.length;

  return (
    <>
      <PageHero
        eyebrow="About COMPUTECH"
        title={
          <>
            Built for people who
            <br />
            <span className="text-violet">read the spec sheet.</span>
          </>
        }
        description={settings.store_tagline}
        crumbs={[{ label: "About" }]}
        aside={
          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <p className="font-display text-2xl font-bold text-neon">{roots.length}</p>
              <p className="mt-0.5 text-[10px] uppercase tracking-[0.14em] text-white/40">
                Departments
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <p className="font-display text-2xl font-bold text-neon">{brands.length}</p>
              <p className="mt-0.5 text-[10px] uppercase tracking-[0.14em] text-white/40">
                Brands
              </p>
            </div>
            <div className="col-span-2 rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <p className="font-display text-2xl font-bold text-neon">{demoCount}</p>
              <p className="mt-0.5 text-[10px] uppercase tracking-[0.14em] text-white/40">
                Categories in the seeded catalog
              </p>
            </div>
          </div>
        }
      />

      <section className="container-page py-12 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div>
            <SectionHeading
              eyebrow="Why we exist"
              title="A technology store should behave like a technical shop."
              description="COMPUTECH is organised around how hardware is actually chosen: find the platform, match the parts, confirm the fit, then buy with the warranty and delivery details attached."
            />
            <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted">
              <p>
                The catalog covers complete systems, laptops, desktop components, networking
                equipment, installation tools and accessories. Each range is structured with
                categories, filters and product specifications instead of a wall of marketing copy.
              </p>
              <p>
                The PC Builder is the clearest example. Instead of a static list, it reads live
                component data and flags incompatible sockets, memory generations, clearance
                conflicts and power shortfalls. Recommendations are generated from that same
                catalog and current stock.
              </p>
              <p>
                Orders, payments, shipping and warranty data live in the same database. That means
                a campaign price, a stock count and an order total cannot drift apart between
                screens.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/pc-builder" className={buttonVariants({ size: "lg" })}>
                Open the PC Builder <ArrowRight />
              </Link>
              <Link href="/contact" className={buttonVariants({ variant: "outline", size: "lg" })}>
                Talk to the team
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {principles.map((item) => (
              <div key={item.title} className="rounded-2xl border border-line bg-white p-5">
                <span className="flex size-10 items-center justify-center rounded-xl bg-violet-soft text-violet">
                  <item.icon className="size-4" />
                </span>
                <h3 className="mt-3 font-display text-base font-semibold">{item.title}</h3>
                <p className="mt-1.5 text-[12px] leading-relaxed text-muted">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-white py-12 lg:py-16">
        <div className="container-page">
          <SectionHeading
            eyebrow="What we sell"
            title="Four ranges. One catalog."
            description="Every range shares the same search, stock, pricing and order pipeline."
          />
          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {ranges.map((range) => (
              <Link
                key={range.label}
                href={range.href}
                className="group flex items-center justify-between gap-3 rounded-2xl border border-line bg-mist/40 p-4 transition-colors hover:border-violet/30 hover:bg-white"
              >
                <span className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-ink text-white">
                    <range.icon className="size-4" />
                  </span>
                  <span className="text-[13px] font-semibold">{range.label}</span>
                </span>
                <ArrowRight className="size-4 text-muted transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-12 lg:py-16">
        <SectionHeading
          eyebrow="The selection"
          title="Parts worth building around"
          action={
            <Link href="/products" className={buttonVariants({ variant: "outline", size: "sm" })}>
              View the catalog <ArrowRight />
            </Link>
          }
        />
        <ProductGrid products={featured} className="mt-7" />
      </section>

      <section className="container-page pb-16">
        <div className="relative overflow-hidden rounded-3xl bg-ink p-7 text-white sm:p-10">
          <div className="absolute inset-0 tech-grid opacity-60" aria-hidden />
          <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <Badge tone="violet" className="border-violet/30 bg-violet/90 text-white">
                <Sparkles className="size-3" /> Store information
              </Badge>
              <h2 className="display-md mt-3 max-w-2xl text-white">
                Contact details are published from store settings, not hard-coded into pages.
              </h2>
              <div className="mt-4 grid gap-2 text-[13px] text-white/60 sm:grid-cols-2">
                <p>
                  <span className="text-white/35">Email:</span>{" "}
                  {settings.store_email || "Configure in Admin → Settings"}
                </p>
                <p>
                  <span className="text-white/35">WhatsApp:</span>{" "}
                  {settings.store_whatsapp || "Configure in Admin → Settings"}
                </p>
                <p>
                  <span className="text-white/35">Hours:</span> {settings.store_hours}
                </p>
                <p>
                  <span className="text-white/35">Address:</span>{" "}
                  {settings.store_address || "Configure in Admin → Settings"}
                </p>
              </div>
            </div>
            <Link
              href="/contact"
              className={cn(buttonVariants({ variant: "primary", size: "lg" }), "bg-violet")}
            >
              Send a message
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
