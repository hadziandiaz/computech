import { ArrowRight, Cpu, Gauge, Printer, Save, Share2, ShieldCheck, ShoppingCart } from "lucide-react";
import Link from "next/link";

import { PageHero } from "@/components/layout/page-hero";
import { PcBuilder } from "@/components/pc-builder/builder";
import { buttonVariants } from "@/components/ui/button";
import { getAuthUser, loginPath } from "@/lib/auth";
import { getPcComponentCatalog } from "@/lib/data/products";
import type { BuilderSelection, PcComponent } from "@/lib/pc-builder/compatibility";
import { productUnitPrice } from "@/lib/pricing";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "PC Builder",
  description:
    "Design a compatible PC from live stock and pricing. Check sockets, memory, clearance, power and connectors before you buy.",
};

const highlights = [
  { icon: Cpu, title: "Live catalog", detail: "Every part is a real product with stock and current pricing." },
  { icon: ShieldCheck, title: "Compatibility checks", detail: "Socket, memory, clearance, power and connector rules." },
  { icon: Gauge, title: "Budget aware", detail: "Set a budget and workload for a recommended starting point." },
  { icon: ShoppingCart, title: "One-click buying", detail: "Add the whole build to your cart, print it or share it." },
];

export default async function PcBuilderPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const productParam = Array.isArray(params.product) ? params.product[0] : params.product;
  const [catalog, user] = await Promise.all([getPcComponentCatalog(), getAuthUser()]);

  // Align the builder price with campaign pricing shown across the store.
  const components: PcComponent[] = catalog.map((product) => {
    const effective = product.effective_price ?? productUnitPrice(product);
    return {
      ...product,
      discount_price: effective < product.price ? effective : product.discount_price,
    };
  });

  const initialSelection: BuilderSelection = {};
  if (productParam) {
    const match = components.find((component) => component.id === productParam);
    if (match?.pc_spec) initialSelection[match.pc_spec.component_type] = match;
  }

  return (
    <>
      <PageHero
        eyebrow="PC Builder"
        title={
          <>
            Build the machine.
            <br />
            <span className="text-violet">Check every fit.</span>
          </>
        }
        description="Pick parts from the live COMPUTECH catalog. The builder validates sockets, memory generation, slot counts, GPU and cooler clearance, power headroom and connectors as you go."
        crumbs={[{ label: "PC Builder" }]}
        actions={
          <>
            <Link href="/pc-components" className={cn(buttonVariants({ variant: "primary", size: "lg" }))}>
              Browse PC components <ArrowRight />
            </Link>
            <Link
              href="/compare"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "border-white/20 bg-transparent text-white hover:border-white/50 hover:bg-white/10",
              )}
            >
              Compare selected parts
            </Link>
          </>
        }
        aside={
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-2">
            {highlights.map((item) => (
              <div key={item.title} className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                <item.icon className="size-4 text-neon" />
                <p className="mt-2 text-[11px] font-semibold text-white">{item.title}</p>
                <p className="mt-0.5 text-[10px] leading-relaxed text-white/45">{item.detail}</p>
              </div>
            ))}
          </div>
        }
      />

      <div className="container-page py-8 lg:py-10">
        {!user ? (
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-violet/20 bg-violet-soft px-4 py-3">
            <p className="flex items-center gap-2 text-[13px] font-medium text-violet-dark">
              <Save className="size-4" />
              Sign in to save builds, keep them in your account and share a public link.
            </p>
            <Link
              href={loginPath("/pc-builder")}
              className={buttonVariants({ variant: "dark", size: "sm" })}
            >
              Sign in to save
            </Link>
          </div>
        ) : null}

        <PcBuilder
          components={components}
          initialSelection={initialSelection}
          signedIn={Boolean(user)}
        />

        <div className="mt-8 grid gap-3 sm:grid-cols-3 print:hidden">
          {[
            {
              icon: Save,
              title: "Saved to your account",
              detail: "Builds are stored in Supabase with their items and total price.",
            },
            {
              icon: Share2,
              title: "Share or print",
              detail: "Publish a read-only link or print a parts list for a quote.",
            },
            {
              icon: Printer,
              title: "Buy the whole build",
              detail: "Components are checked against live stock before being added.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-line bg-white p-4">
              <item.icon className="size-4 text-violet" />
              <p className="mt-2 text-[13px] font-semibold">{item.title}</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-muted">{item.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
