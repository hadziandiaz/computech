import { CalendarClock, Megaphone, Percent, Plus, Tag, Trash2 } from "lucide-react";

import { AdminHeader } from "@/components/admin/admin-header";
import { ActionForm, InlineButton, SubmitButton } from "@/components/ui/action-form";
import { Badge } from "@/components/ui/badge";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/input";
import {
  deletePromotionAction,
  savePromotionAction,
} from "@/lib/actions/admin/merchandising";
import { getAuthUser } from "@/lib/auth";
import { getAllPromotions, type PromotionWithProducts } from "@/lib/data/promotions";
import { getAdminPcComponentProducts } from "@/lib/data/products";
import { formatDate, formatDateTime, formatIDR } from "@/lib/format";
import type { Product } from "@/types/domain";

export const metadata = {
  title: "Promotions",
};

const PROMOTION_TYPES = [
  { value: "flash_sale", label: "Flash sale" },
  { value: "product_discount", label: "Product discount" },
  { value: "bundle", label: "Bundle" },
  { value: "voucher", label: "Voucher campaign" },
  { value: "free_shipping", label: "Free shipping" },
  { value: "seasonal", label: "Seasonal" },
  { value: "special_offer", label: "Special offer" },
  { value: "member_discount", label: "Member discount" },
];

function toLocalInput(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function promotionState(promotion: PromotionWithProducts) {
  const now = Date.now();
  const start = new Date(promotion.start_date).getTime();
  const end = new Date(promotion.end_date).getTime();
  if (!promotion.is_active) return { label: "Inactive", tone: "neutral" as const };
  if (now < start) return { label: "Scheduled", tone: "cyan" as const };
  if (now > end) return { label: "Ended", tone: "neutral" as const };
  return { label: "Live", tone: "success" as const };
}

function PromotionFields({
  promotion,
  products,
}: {
  promotion?: PromotionWithProducts;
  products: Product[];
}) {
  const key = promotion?.id ?? "new";
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Promotion name" htmlFor={`promo-name-${key}`} required>
          <Input id={`promo-name-${key}`} name="name" defaultValue={promotion?.name} required />
        </Field>
        <Field label="Slug" htmlFor={`promo-slug-${key}`} hint="Leave blank to generate.">
          <Input id={`promo-slug-${key}`} name="slug" defaultValue={promotion?.slug} />
        </Field>
        <Field label="Type" htmlFor={`promo-type-${key}`}>
          <Select id={`promo-type-${key}`} name="type" defaultValue={promotion?.type ?? "seasonal"}>
            {PROMOTION_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Discount type" htmlFor={`promo-discount-type-${key}`}>
          <Select
            id={`promo-discount-type-${key}`}
            name="discount_type"
            defaultValue={promotion?.discount_type ?? "percentage"}
          >
            <option value="percentage">Percentage</option>
            <option value="fixed">Fixed amount</option>
          </Select>
        </Field>
        <Field label="Discount value" htmlFor={`promo-discount-value-${key}`} required>
          <Input
            id={`promo-discount-value-${key}`}
            name="discount_value"
            type="number"
            min={0}
            defaultValue={promotion?.discount_value ?? 10}
            required
          />
        </Field>
        <Field label="Minimum purchase (IDR)" htmlFor={`promo-min-${key}`}>
          <Input
            id={`promo-min-${key}`}
            name="min_purchase"
            type="number"
            min={0}
            step={1000}
            defaultValue={promotion?.min_purchase ?? 0}
          />
        </Field>
        <Field label="Maximum discount (IDR)" htmlFor={`promo-max-${key}`} hint="Blank for no cap.">
          <Input
            id={`promo-max-${key}`}
            name="max_discount"
            type="number"
            min={0}
            step={1000}
            defaultValue={promotion?.max_discount ?? ""}
          />
        </Field>
        <Field label="Usage limit" htmlFor={`promo-usage-${key}`} hint="Blank for unlimited.">
          <Input
            id={`promo-usage-${key}`}
            name="usage_limit"
            type="number"
            min={1}
            defaultValue={promotion?.usage_limit ?? ""}
          />
        </Field>
        <Field label="Starts" htmlFor={`promo-start-${key}`} required>
          <Input
            id={`promo-start-${key}`}
            name="start_date"
            type="datetime-local"
            defaultValue={toLocalInput(promotion?.start_date) || toLocalInput(new Date().toISOString())}
            required
          />
        </Field>
        <Field label="Ends" htmlFor={`promo-end-${key}`} required>
          <Input
            id={`promo-end-${key}`}
            name="end_date"
            type="datetime-local"
            defaultValue={toLocalInput(promotion?.end_date)}
            required
          />
        </Field>
        <Field label="Banner URL" htmlFor={`promo-banner-${key}`} className="sm:col-span-2">
          <Input
            id={`promo-banner-${key}`}
            name="banner_url"
            defaultValue={promotion?.banner_url ?? ""}
            placeholder="https://…"
          />
        </Field>
        <Field label="Description" htmlFor={`promo-description-${key}`} className="sm:col-span-2">
          <Textarea
            id={`promo-description-${key}`}
            name="description"
            rows={2}
            defaultValue={promotion?.description ?? ""}
          />
        </Field>
      </div>

      <label className="flex items-center gap-2 text-[12px]">
        <Checkbox name="is_active" defaultChecked={promotion?.is_active ?? true} />
        Promotion is active
      </label>

      <div>
        <p className="mb-1.5 text-[13px] font-semibold">Products</p>
        <p className="mb-2 text-[11px] text-muted">
          Only selected products receive the campaign price. Leave empty to keep the campaign
          informational.
        </p>
        <div className="max-h-56 overflow-y-auto rounded-xl border border-line bg-mist/20 p-2">
          {products.map((product) => (
            <label
              key={product.id}
              className="flex items-center gap-2 rounded-lg px-2 py-1 text-[12px] hover:bg-white"
            >
              <Checkbox
                name="product_ids"
                value={product.id}
                defaultChecked={promotion?.product_ids?.includes(product.id) ?? false}
              />
              <span className="line-clamp-1">{product.name}</span>
              <span className="ml-auto shrink-0 font-mono text-[10px] text-muted">
                {formatIDR(product.price)}
              </span>
            </label>
          ))}
          {!products.length ? (
            <p className="px-2 py-3 text-[12px] text-muted">No products available yet.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default async function AdminPromotionsPage() {
  const [promotions, products, user] = await Promise.all([
    getAllPromotions(),
    getAdminPcComponentProducts(),
    getAuthUser(),
  ]);

  const live = promotions.filter((promotion) => promotionState(promotion).label === "Live");

  return (
    <div>
      <AdminHeader
        eyebrow="Merchandising"
        title="Promotions"
        description="Campaign pricing is applied by the same rule in the catalog and in the order pricing function. The best eligible price always wins."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-line bg-white p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted">Live</p>
          <p className="mt-1 font-display text-2xl font-bold">{live.length}</p>
          <p className="text-[11px] text-muted">Currently discounting products</p>
        </div>
        <div className="rounded-2xl border border-line bg-white p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted">
            All campaigns
          </p>
          <p className="mt-1 font-display text-2xl font-bold">{promotions.length}</p>
          <p className="text-[11px] text-muted">Across every status</p>
        </div>
        <div className="rounded-2xl border border-line bg-white p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted">
            Discounted products
          </p>
          <p className="mt-1 font-display text-2xl font-bold">
            {new Set(live.flatMap((promotion) => promotion.product_ids)).size}
          </p>
          <p className="text-[11px] text-muted">Unique products in live campaigns</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.45fr_1fr] xl:items-start">
        <section className="rounded-2xl border border-line bg-white">
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
            <h2 className="flex items-center gap-2 font-display text-base font-semibold">
              <Megaphone className="size-4 text-violet" /> Campaigns
            </h2>
            <Badge tone="neutral">{promotions.length}</Badge>
          </div>
          {promotions.length ? (
            <ul className="divide-y divide-line">
              {promotions.map((promotion) => {
                const state = promotionState(promotion);
                return (
                  <li key={promotion.id}>
                    <details className="group">
                      <summary className="flex cursor-pointer list-none flex-wrap items-start justify-between gap-3 px-5 py-3.5 hover:bg-mist/40 [&::-webkit-details-marker]:hidden">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-[13px] font-semibold">{promotion.name}</p>
                            <Badge tone={state.tone}>{state.label}</Badge>
                          </div>
                          <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted">
                            <span className="inline-flex items-center gap-1">
                              <Tag className="size-3" />
                              {promotion.type.replaceAll("_", " ")}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Percent className="size-3" />
                              {promotion.discount_type === "percentage"
                                ? `${promotion.discount_value}%`
                                : formatIDR(promotion.discount_value)}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <CalendarClock className="size-3" />
                              {formatDate(promotion.start_date)} → {formatDate(promotion.end_date)}
                            </span>
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[11px] font-semibold">
                            {promotion.product_ids.length} product
                            {promotion.product_ids.length === 1 ? "" : "s"}
                          </p>
                          <p className="text-[10px] text-muted">
                            used {promotion.used_count}
                            {promotion.usage_limit ? ` / ${promotion.usage_limit}` : ""}
                          </p>
                        </div>
                      </summary>
                      <div className="border-t border-line/60 bg-mist/20 px-5 py-4">
                        <ActionForm action={savePromotionAction} className="space-y-4">
                          <input type="hidden" name="id" value={promotion.id} />
                          <PromotionFields promotion={promotion} products={products} />
                          <div className="flex flex-wrap items-center gap-2">
                            <SubmitButton size="sm" pendingText="Saving…">
                              Save promotion
                            </SubmitButton>
                            <InlineButton
                              action={deletePromotionAction.bind(null, promotion.id)}
                              variant="danger-ghost"
                              size="sm"
                              confirm={`Delete ${promotion.name}? Product prices revert to their normal price.`}
                              pendingText="Deleting…"
                            >
                              <Trash2 /> Delete
                            </InlineButton>
                          </div>
                        </ActionForm>
                        <p className="mt-3 text-[10px] text-muted">
                          Last updated {formatDateTime(promotion.updated_at)}
                          {user?.role === "staff" ? " · staff can manage campaigns" : ""}
                        </p>
                      </div>
                    </details>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="px-5 py-10 text-center text-[13px] text-muted">
              No promotions yet. Create your first campaign on the right.
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-line bg-white p-5">
          <h2 className="flex items-center gap-2 font-display text-base font-semibold">
            <Plus className="size-4 text-violet" /> New promotion
          </h2>
          <p className="mt-1 text-xs text-muted">
            Campaign prices appear automatically on the storefront, cart and checkout while live.
          </p>
          <ActionForm action={savePromotionAction} resetOnSuccess className="mt-4">
            <PromotionFields products={products} />
            <div className="mt-4">
              <SubmitButton size="sm" pendingText="Creating…">
                Create promotion
              </SubmitButton>
            </div>
          </ActionForm>
        </section>
      </div>
    </div>
  );
}
