import { Cpu, ListChecks, Search } from "lucide-react";
import Link from "next/link";

import { AdminHeader } from "@/components/admin/admin-header";
import { PcSpecForm } from "@/components/admin/pc-spec-form";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAdminPcComponentProducts } from "@/lib/data/products";
import { pcComponentLabels, pcComponentOrder } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "PC components",
};

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export default async function AdminPcComponentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const q = single(params.q).trim().toLowerCase();
  const products = await getAdminPcComponentProducts();

  const filtered = q
    ? products.filter(
        (product) =>
          product.name.toLowerCase().includes(q) ||
          product.sku.toLowerCase().includes(q) ||
          (product.brand?.name ?? "").toLowerCase().includes(q),
      )
    : products;

  const mapped = filtered.filter((product) => product.pc_spec);
  const unmapped = filtered.filter((product) => !product.pc_spec);

  const groups = pcComponentOrder.map((type) => ({
    type,
    label: pcComponentLabels[type],
    products: mapped.filter((product) => product.pc_spec?.component_type === type),
  }));
  const otherMapped = mapped.filter(
    (product) =>
      product.pc_spec &&
      !(pcComponentOrder as readonly string[]).includes(product.pc_spec.component_type),
  );

  return (
    <div>
      <AdminHeader
        eyebrow="PC Builder"
        title="Component specifications"
        description="The compatibility engine reads these fields. Every compatible rule compares sockets, memory type, form factor, power and clearance values from this table."
        actions={
          <Link href="/pc-builder" target="_blank" className={buttonVariants({ variant: "outline", size: "sm" })}>
            <Cpu /> Open builder
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {groups.slice(0, 4).map((group) => (
          <div key={group.type} className="rounded-2xl border border-line bg-white p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted">
              {group.label}
            </p>
            <p className="mt-1 font-display text-2xl font-bold">{group.products.length}</p>
            <p className="text-[11px] text-muted">spec records</p>
          </div>
        ))}
      </div>

      <section className="mt-6 rounded-2xl border border-line bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-4">
          <h2 className="flex items-center gap-2 font-display text-base font-semibold">
            <ListChecks className="size-4 text-violet" /> Spec library
          </h2>
          <form method="get" className="flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
              <Input
                name="q"
                defaultValue={q}
                placeholder="Search component or SKU…"
                className="h-9 w-60 pl-9 text-[12px]"
              />
            </div>
            <button type="submit" className={buttonVariants({ variant: "outline", size: "sm" })}>
              Search
            </button>
          </form>
        </div>

        <div className="divide-y divide-line">
          {groups.map((group) => (
            <div key={group.type}>
              <div className="flex items-center justify-between gap-3 bg-mist/40 px-4 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                  {group.label}
                </p>
                <Badge tone={group.products.length ? "violet" : "neutral"}>
                  {group.products.length}
                </Badge>
              </div>
              {group.products.length ? (
                <ul className="divide-y divide-line/70">
                  {group.products.map((product) => (
                    <li key={product.id}>
                      <details className="group">
                        <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-2 px-4 py-2.5 hover:bg-mist/30 [&::-webkit-details-marker]:hidden">
                          <div className="min-w-0">
                            <p className="line-clamp-1 text-[12px] font-semibold">{product.name}</p>
                            <p className="font-mono text-[10px] text-muted">
                              {product.sku}
                              {product.brand?.name ? ` · ${product.brand.name}` : ""}
                            </p>
                          </div>
                          <Badge tone={product.status === "active" ? "success" : "neutral"}>
                            {product.status.replaceAll("_", " ")}
                          </Badge>
                        </summary>
                        <div className="border-t border-line/60 bg-mist/10 p-4">
                          <PcSpecForm
                            productId={product.id}
                            productName={product.name}
                            spec={product.pc_spec}
                          />
                        </div>
                      </details>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-4 py-4 text-[12px] text-muted">
                  No {group.label.toLowerCase()} specs yet. Assign one from the unassigned list below.
                </p>
              )}
            </div>
          ))}
          {otherMapped.length ? (
            <div>
              <div className="flex items-center justify-between gap-3 bg-mist/40 px-4 py-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                  Other component types
                </p>
                <Badge tone="neutral">{otherMapped.length}</Badge>
              </div>
              <ul className="divide-y divide-line/70">
                {otherMapped.map((product) => (
                  <li key={product.id}>
                    <details>
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-2.5 hover:bg-mist/30 [&::-webkit-details-marker]:hidden">
                        <p className="line-clamp-1 text-[12px] font-semibold">{product.name}</p>
                        <Badge tone="warning">{product.pc_spec?.component_type}</Badge>
                      </summary>
                      <div className="border-t border-line/60 bg-mist/10 p-4">
                        <PcSpecForm
                          productId={product.id}
                          productName={product.name}
                          spec={product.pc_spec}
                        />
                      </div>
                    </details>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-line bg-white">
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          <h2 className="font-display text-base font-semibold">Products without specs</h2>
          <Badge tone={unmapped.length ? "warning" : "success"}>{unmapped.length}</Badge>
        </div>
        {unmapped.length ? (
          <ul className="divide-y divide-line">
            {unmapped.slice(0, 30).map((product) => (
              <li key={product.id}>
                <details>
                  <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-2 px-4 py-2.5 hover:bg-mist/30 [&::-webkit-details-marker]:hidden">
                    <div className="min-w-0">
                      <p className="line-clamp-1 text-[12px] font-semibold">{product.name}</p>
                      <p className="font-mono text-[10px] text-muted">
                        {product.sku} · {product.category?.name ?? "Uncategorised"}
                      </p>
                    </div>
                    <span className={cn("text-[11px] font-semibold text-violet")}>
                      Assign specs
                    </span>
                  </summary>
                  <div className="border-t border-line/60 bg-mist/10 p-4">
                    <PcSpecForm productId={product.id} productName={product.name} spec={null} />
                  </div>
                </details>
              </li>
            ))}
            {unmapped.length > 30 ? (
              <li className="px-4 py-3 text-center text-[11px] text-muted">
                Showing the first 30. Use search to find a specific product.
              </li>
            ) : null}
          </ul>
        ) : (
          <p className="px-4 py-8 text-center text-[13px] text-muted">
            Every product in this view has a component spec record.
          </p>
        )}
      </section>
    </div>
  );
}
