import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ClipboardList,
  Search,
  SlidersHorizontal,
  Warehouse,
} from "lucide-react";
import Link from "next/link";

import { AdminHeader } from "@/components/admin/admin-header";
import { ActionForm, SubmitButton } from "@/components/ui/action-form";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import {
  adjustStockAction,
  updateStockThresholdAction,
} from "@/lib/actions/admin/inventory";
import { getAdminInventory, getInventoryMovements } from "@/lib/data/admin";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Inventory",
};

const MOVEMENT_TONES: Record<string, "success" | "coral" | "warning"> = {
  in: "success",
  out: "coral",
  adjustment: "warning",
  sale: "coral",
  return: "success",
  reservation: "warning",
};

const FILTERS = [
  { key: "all", label: "All stock" },
  { key: "low", label: "Low & out of stock" },
] as const;

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export default async function AdminInventoryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const view = single(params.view) === "low" ? "low" : "all";
  const q = single(params.q).trim().toLowerCase();

  const [inventory, movements] = await Promise.all([
    getAdminInventory(view === "low"),
    getInventoryMovements(40),
  ]);

  const rows = q
    ? inventory.filter(
        (row) =>
          row.name.toLowerCase().includes(q) ||
          row.sku.toLowerCase().includes(q) ||
          (row.brand_name ?? "").toLowerCase().includes(q),
      )
    : inventory;

  const totals = inventory.reduce(
    (acc, row) => {
      acc.stock += row.stock;
      acc.reserved += row.reserved;
      if (row.stock <= row.low_stock_threshold) acc.low += 1;
      return acc;
    },
    { stock: 0, reserved: 0, low: 0 },
  );

  return (
    <div>
      <AdminHeader
        eyebrow="Operations"
        title="Inventory"
        description="Every stock movement is written to the movement ledger and mirrored on the product record. Reserved units are held by pending orders."
        actions={
          <Link
            href="/admin/inventory?view=low"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <SlidersHorizontal /> Low stock view
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-line bg-white p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted">
            Units on hand
          </p>
          <p className="mt-1 font-display text-2xl font-bold">{totals.stock}</p>
          <p className="text-[11px] text-muted">Across {inventory.length} SKUs</p>
        </div>
        <div className="rounded-2xl border border-line bg-white p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted">
            Reserved
          </p>
          <p className="mt-1 font-display text-2xl font-bold">{totals.reserved}</p>
          <p className="text-[11px] text-muted">Held by unfulfilled orders</p>
        </div>
        <div className="rounded-2xl border border-line bg-white p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted">
            At or below threshold
          </p>
          <p className="mt-1 font-display text-2xl font-bold">{totals.low}</p>
          <p className="text-[11px] text-muted">Needs replenishment</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.55fr_1fr] xl:items-start">
        <section className="rounded-2xl border border-line bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-4">
            <div className="flex gap-1">
              {FILTERS.map((filter) => (
                <Link
                  key={filter.key}
                  href={filter.key === "all" ? "/admin/inventory" : `/admin/inventory?view=${filter.key}`}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-colors",
                    view === filter.key
                      ? "bg-violet-soft text-violet-dark"
                      : "text-muted hover:bg-mist hover:text-ink",
                  )}
                >
                  {filter.label}
                </Link>
              ))}
            </div>
            <form method="get" className="flex items-center gap-2">
              <input type="hidden" name="view" value={view} />
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
                <Input
                  name="q"
                  defaultValue={q}
                  placeholder="Search product or SKU…"
                  className="h-9 w-56 pl-9 text-[12px]"
                />
              </div>
              <button type="submit" className={buttonVariants({ variant: "outline", size: "sm" })}>
                Search
              </button>
            </form>
          </div>

          {rows.length ? (
            <ul className="divide-y divide-line">
              {rows.map((row) => {
                const low = row.stock <= row.low_stock_threshold;
                return (
                  <li key={row.product_id}>
                    <details className="group">
                      <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-mist/40 [&::-webkit-details-marker]:hidden">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="line-clamp-1 text-[13px] font-semibold">{row.name}</p>
                            {row.stock === 0 ? (
                              <Badge tone="coral">Out of stock</Badge>
                            ) : low ? (
                              <Badge tone="warning">Low stock</Badge>
                            ) : null}
                          </div>
                          <p className="font-mono text-[10px] text-muted">
                            {row.sku}
                            {row.brand_name ? ` · ${row.brand_name}` : ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 text-right">
                          <div>
                            <p className="font-display text-base font-bold">{row.stock}</p>
                            <p className="text-[10px] text-muted">on hand</p>
                          </div>
                          <div>
                            <p className="text-[13px] font-semibold text-muted">{row.reserved}</p>
                            <p className="text-[10px] text-muted">reserved</p>
                          </div>
                          <div>
                            <p className="text-[13px] font-semibold text-muted">
                              {row.low_stock_threshold}
                            </p>
                            <p className="text-[10px] text-muted">threshold</p>
                          </div>
                        </div>
                      </summary>

                      <div className="grid gap-4 border-t border-line/60 bg-mist/20 px-4 py-4 md:grid-cols-2">
                        <div>
                          <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                            <ArrowDownToLine className="size-3.5" /> Adjust stock
                          </p>
                          <ActionForm action={adjustStockAction} resetOnSuccess className="space-y-2">
                            <input type="hidden" name="product_id" value={row.product_id} />
                            <div className="grid grid-cols-2 gap-2">
                              <Select name="movement_type" defaultValue="in" className="h-9 text-[12px]">
                                <option value="in">Stock in</option>
                                <option value="out">Stock out</option>
                                <option value="adjustment">Set adjustment</option>
                              </Select>
                              <Input
                                name="quantity"
                                type="number"
                                min={1}
                                defaultValue={1}
                                required
                                className="h-9 text-[12px]"
                              />
                            </div>
                            <Input
                              name="note"
                              placeholder="Reason, supplier or reference"
                              className="h-9 text-[12px]"
                            />
                            <SubmitButton size="sm" variant="dark" pendingText="Updating…">
                              Apply movement
                            </SubmitButton>
                          </ActionForm>
                        </div>

                        <div>
                          <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                            <SlidersHorizontal className="size-3.5" /> Low-stock threshold
                          </p>
                          <ActionForm action={updateStockThresholdAction} className="space-y-2">
                            <input type="hidden" name="product_id" value={row.product_id} />
                            <Input
                              name="low_stock_threshold"
                              type="number"
                              min={0}
                              defaultValue={row.low_stock_threshold}
                              className="h-9 text-[12px]"
                            />
                            <SubmitButton size="sm" variant="outline" pendingText="Saving…">
                              Save threshold
                            </SubmitButton>
                          </ActionForm>
                          <p className="mt-2 text-[10px] text-muted">
                            Last updated {formatDateTime(row.updated_at)}
                          </p>
                        </div>
                      </div>
                    </details>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="px-5 py-10 text-center text-[13px] text-muted">
              No inventory rows match. Products are created with an inventory record automatically.
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-line bg-white">
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
            <h2 className="flex items-center gap-2 font-display text-base font-semibold">
              <ClipboardList className="size-4 text-violet" /> Movement ledger
            </h2>
            <Badge tone="neutral">latest {movements.length}</Badge>
          </div>
          {movements.length ? (
            <ul className="max-h-[560px] divide-y divide-line overflow-y-auto">
              {movements.map((movement) => (
                <li key={movement.id} className="px-5 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="line-clamp-1 text-[12px] font-semibold">
                        {movement.product_name}
                      </p>
                      <p className="text-[10px] text-muted">
                        {formatDateTime(movement.created_at)}
                        {movement.note ? ` · ${movement.note}` : ""}
                      </p>
                    </div>
                    <Badge tone={MOVEMENT_TONES[movement.movement_type] ?? "neutral"}>
                      {movement.movement_type === "in" ? (
                        <ArrowDownToLine className="size-3" />
                      ) : movement.movement_type === "out" ? (
                        <ArrowUpFromLine className="size-3" />
                      ) : (
                        <Warehouse className="size-3" />
                      )}
                      {movement.movement_type === "out" ? "−" : "+"}
                      {movement.quantity}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-[10px] text-muted">
                    Stock after movement: {movement.stock_after}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-10 text-center text-[13px] text-muted">
              No stock movements recorded yet. Adjust a product above to start the ledger.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
