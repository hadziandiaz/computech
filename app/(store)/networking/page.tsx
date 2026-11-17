import {
  ArrowRight,
  Cable,
  Network,
  Router,
  ShieldCheck,
  Wifi,
  Wrench,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { PageHero } from "@/components/layout/page-hero";
import { ProductGrid } from "@/components/store/product-grid";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { getCategories } from "@/lib/data/categories";
import { getProducts } from "@/lib/data/products";

export const metadata = {
  title: "Networking equipment and tools",
  description:
    "Routers, switches, access points, ONTs, cabling, connectors and installation tools for reliable networks.",
};

const pillars = [
  {
    icon: Router,
    title: "Routing & gateways",
    detail: "Home routers, business gateways, firewalls and fibre terminals.",
    slug: "router",
  },
  {
    icon: Network,
    title: "Switching",
    detail: "Unmanaged, managed and PoE switches for access and distribution.",
    slug: "switch",
  },
  {
    icon: Wifi,
    title: "Wireless",
    detail: "Wi-Fi 6 access points and adapters for clean coverage.",
    slug: "access-point",
  },
  {
    icon: Cable,
    title: "Cabling & connectors",
    detail: "Copper and fibre cable, keystones, patch panels and patch cords.",
    slug: "utp-cable",
  },
  {
    icon: Wrench,
    title: "Installation tools",
    detail: "Crimpers, testers, punch-down tools and cable strippers.",
    slug: "crimping-tool",
  },
  {
    icon: ShieldCheck,
    title: "Racks & management",
    detail: "Wall-mount racks, patch panels and cable management.",
    slug: "network-rack",
  },
];

export default async function NetworkingPage() {
  const [products, categories] = await Promise.all([
    getProducts({ categorySlug: "networking", sort: "featured", perPage: 8 }),
    getCategories(),
  ]);

  const networking = categories.find((category) => category.slug === "networking");
  const tools = categories.find((category) => category.slug === "networking-tools");
  const networkingChildren = categories.filter(
    (category) => category.parent_id === networking?.id,
  );
  const toolChildren = categories.filter((category) => category.parent_id === tools?.id);

  return (
    <>
      <PageHero
        eyebrow="Networking"
        title="Build the network, not just the PC."
        description="Routing, switching, wireless and the materials that terminate every run. Equipment and tools are catalogued with the details installers ask for."
        crumbs={[{ label: "Networking" }]}
        actions={
          <>
            <Link href="/categories/networking" className={buttonVariants({ size: "md" })}>
              Shop networking <ArrowRight />
            </Link>
            <Link
              href="/categories/networking-tools"
              className={buttonVariants({ variant: "outline", size: "md" })}
            >
              Shop tools
            </Link>
          </>
        }
        aside={
          <div className="grid grid-cols-2 gap-2">
            {(networking?.image_url || tools?.image_url) && (
              <>
                {[networking, tools].map((category) =>
                  category?.image_url ? (
                    <div
                      key={category.id}
                      className="relative size-28 overflow-hidden rounded-2xl border border-white/10 lg:size-32"
                    >
                      <Image
                        src={category.image_url}
                        alt={category.name}
                        fill
                        sizes="128px"
                        className="object-cover opacity-80"
                      />
                    </div>
                  ) : null,
                )}
              </>
            )}
          </div>
        }
      />

      <section className="border-b border-line bg-white">
        <div className="container-page grid gap-3 py-6 sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map((pillar) => {
            const child = categories.find((category) => category.slug === pillar.slug);
            return (
              <Link
                key={pillar.title}
                href={child ? `/categories/${child.slug}` : "/categories/networking"}
                className="group flex items-start gap-3 rounded-2xl border border-line px-4 py-3.5 transition-colors hover:border-violet/30 hover:bg-mist/60"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-ink text-white">
                  <pillar.icon className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold">{pillar.title}</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-muted">{pillar.detail}</p>
                </div>
                <ArrowRight className="ml-auto mt-1 size-3.5 shrink-0 text-muted transition-transform group-hover:translate-x-0.5" />
              </Link>
            );
          })}
        </div>
      </section>

      <section className="container-page py-10 lg:py-14">
        <SectionHeading
          eyebrow="Networking catalog"
          title="Equipment in stock"
          description="Open a product to see ports, standards and installation notes where available."
          action={
            <Link href="/categories/networking" className={buttonVariants({ variant: "outline", size: "sm" })}>
              All networking
            </Link>
          }
        />
        {products.products.length ? (
          <ProductGrid products={products.products} className="mt-6" />
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-line bg-white p-10 text-center">
            <p className="font-display text-lg font-semibold">No networking equipment loaded</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted">
              Seed the demo catalog or add products from the admin console to populate this page.
            </p>
          </div>
        )}
      </section>

      <section className="border-y border-line bg-white py-10 lg:py-14">
        <div className="container-page grid gap-8 lg:grid-cols-2">
          {[networking, tools].map((category) =>
            category ? (
              <div key={category.id} className="rounded-3xl border border-line bg-mist/40 p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="eyebrow text-violet">{category.name}</p>
                    <h2 className="mt-1 font-display text-2xl font-bold tracking-tight">
                      {category.slug === "networking"
                        ? "Build the links between systems."
                        : "Finish the installation properly."}
                    </h2>
                  </div>
                  <Badge tone="neutral">{category.children?.length ?? 0} groups</Badge>
                </div>
                <p className="mt-2 text-sm text-muted">{category.description}</p>
                <div className="mt-4 grid grid-cols-2 gap-1.5">
                  {(category.slug === "networking" ? networkingChildren : toolChildren).map((child) => (
                    <Link
                      key={child.id}
                      href={`/categories/${child.slug}`}
                      className="rounded-xl border border-line bg-white px-3 py-2 text-[12px] font-medium transition-colors hover:border-violet/30 hover:text-violet-dark"
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
                <Link
                  href={`/categories/${category.slug}`}
                  className={buttonVariants({ variant: "dark", size: "sm" })}
                >
                  Open {category.slug === "networking" ? "networking" : "tools"}
                </Link>
              </div>
            ) : null,
          )}
        </div>
      </section>

      <section className="container-page py-12">
        <div className="grid gap-6 rounded-3xl bg-violet p-7 text-white sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="eyebrow text-white/70">Planning a deployment?</p>
            <h2 className="mt-2 font-display text-2xl font-bold">
              Send the topology and we will check the bill of materials.
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-white/70">
              Support can confirm PoE budgets, port counts, fibre types and the small parts that are
              easy to forget.
            </p>
          </div>
          <Link
            href="/contact"
            className={buttonVariants({ variant: "dark", size: "lg" })}
          >
            Contact support
          </Link>
        </div>
      </section>
    </>
  );
}
