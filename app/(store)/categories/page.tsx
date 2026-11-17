import { ArrowRight, Layers } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { PageHero } from "@/components/layout/page-hero";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { getCategoryTree } from "@/lib/data/categories";
import { getCatalogFacets } from "@/lib/data/products";

export const metadata = {
  title: "Categories",
  description:
    "Explore every COMPUTECH category: computers, components, networking equipment, tools and accessories.",
};

export default async function CategoriesPage() {
  const [categories, facets] = await Promise.all([getCategoryTree(), getCatalogFacets()]);
  const counts = new Map(facets.categories.map((facet) => [facet.slug, facet.count]));

  return (
    <>
      <PageHero
        eyebrow="Catalog map"
        title="Every category, one structure."
        description="The catalog is organised the way a system is assembled: the machine, the parts inside it, the network it joins and the tools used to build it."
        crumbs={[{ label: "Categories" }]}
        aside={
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
              <p className="font-display text-2xl font-bold text-neon">{categories.length}</p>
              <p className="text-[10px] uppercase tracking-[0.14em] text-white/45">Top categories</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
              <p className="font-display text-2xl font-bold text-neon">
                {categories.reduce((sum, category) => sum + (category.children?.length ?? 0), 0)}
              </p>
              <p className="text-[10px] uppercase tracking-[0.14em] text-white/45">Subcategories</p>
            </div>
          </div>
        }
      />

      <div className="container-page py-10 lg:py-14">
        <div className="space-y-12">
          {categories.map((category, index) => (
            <section key={category.id}>
              <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
                <Link
                  href={`/categories/${category.slug}`}
                  className="group relative min-h-56 overflow-hidden rounded-3xl border border-line bg-ink"
                >
                  {category.image_url ? (
                    <Image
                      src={category.image_url}
                      alt={category.name}
                      fill
                      sizes="(min-width: 1024px) 520px, 100vw"
                      className="object-cover opacity-75 transition-all duration-500 group-hover:scale-[1.02] group-hover:opacity-90"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/35 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                    <p className="font-mono text-[10px] text-neon">0{index + 1}</p>
                    <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-white">
                      {category.name}
                    </h2>
                    <p className="mt-1 max-w-md text-[12px] leading-relaxed text-white/60">
                      {category.description}
                    </p>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-white">
                      Shop category <ArrowRight className="size-3.5" />
                    </span>
                  </div>
                </Link>

                <div className="rounded-3xl border border-line bg-white p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-muted">
                      <Layers className="size-3.5 text-violet" />
                      {category.children?.length ?? 0} subcategories
                    </p>
                    <Badge tone="violet">{counts.get(category.slug) ?? 0} products</Badge>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                    {(category.children ?? []).map((child) => (
                      <Link
                        key={child.id}
                        href={`/categories/${child.slug}`}
                        className="group rounded-xl border border-line px-3 py-2.5 transition-colors hover:border-violet/30 hover:bg-violet-soft/40"
                      >
                        <p className="truncate text-[12px] font-semibold text-ink group-hover:text-violet-dark">
                          {child.name}
                        </p>
                        <p className="mt-0.5 text-[10px] text-muted">
                          {counts.get(child.slug) ?? 0} items
                        </p>
                      </Link>
                    ))}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      href={`/categories/${category.slug}`}
                      className={buttonVariants({ variant: "dark", size: "sm" })}
                    >
                      Open category
                    </Link>
                    <Link
                      href={`/products?category=${category.slug}`}
                      className={buttonVariants({ variant: "outline", size: "sm" })}
                    >
                      Filter products
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          ))}
        </div>

        {!categories.length ? (
          <div className="rounded-3xl border border-dashed border-line bg-white p-12 text-center">
            <SectionHeading
              align="center"
              title="Categories will appear after the seed runs"
              description="Apply the Supabase migrations to create the COMPUTECH category tree and demo catalog."
            />
          </div>
        ) : null}
      </div>
    </>
  );
}
