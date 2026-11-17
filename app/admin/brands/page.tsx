import { BadgeCheck, Plus, Trash2 } from "lucide-react";
import Image from "next/image";

import { AdminHeader } from "@/components/admin/admin-header";
import { ActionForm, InlineButton, SubmitButton } from "@/components/ui/action-form";
import { Badge } from "@/components/ui/badge";
import { Checkbox, Field, Input, Textarea } from "@/components/ui/input";
import { deleteBrandAction, saveBrandAction } from "@/lib/actions/admin/catalog";
import { getAuthUser } from "@/lib/auth";
import { getBrands } from "@/lib/data/brands";
import type { Brand } from "@/types/domain";

export const metadata = {
  title: "Brands",
};

function BrandFields({ brand }: { brand?: Brand }) {
  const key = brand?.id ?? "new";
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Field label="Brand name" htmlFor={`brand-name-${key}`} required>
        <Input id={`brand-name-${key}`} name="name" defaultValue={brand?.name} required />
      </Field>
      <Field label="Slug" htmlFor={`brand-slug-${key}`} hint="Leave blank to generate.">
        <Input id={`brand-slug-${key}`} name="slug" defaultValue={brand?.slug} />
      </Field>
      <Field label="Logo URL" htmlFor={`brand-logo-${key}`} className="sm:col-span-2">
        <Input
          id={`brand-logo-${key}`}
          name="logo_url"
          defaultValue={brand?.logo_url ?? ""}
          placeholder="https://…"
        />
      </Field>
      <Field label="Description" htmlFor={`brand-description-${key}`} className="sm:col-span-2">
        <Textarea
          id={`brand-description-${key}`}
          name="description"
          rows={2}
          defaultValue={brand?.description ?? ""}
        />
      </Field>
      <label className="flex items-center gap-2 text-[12px] sm:col-span-2">
        <Checkbox name="is_active" defaultChecked={brand?.is_active ?? true} />
        Visible on the storefront
      </label>
    </div>
  );
}

export default async function AdminBrandsPage() {
  const [brands, user] = await Promise.all([getBrands(false), getAuthUser()]);

  return (
    <div>
      <AdminHeader
        eyebrow="Catalog"
        title="Brands"
        description="Brand records power the brand directory and product filters. Logos are external URLs so you can use any CDN."
      />

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr] xl:items-start">
        <section className="rounded-2xl border border-line bg-white">
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
            <h2 className="flex items-center gap-2 font-display text-base font-semibold">
              <BadgeCheck className="size-4 text-violet" /> Brand directory
            </h2>
            <Badge tone="neutral">{brands.length} brands</Badge>
          </div>
          {brands.length ? (
            <ul className="divide-y divide-line">
              {brands.map((brand) => (
                <li key={brand.id}>
                  <details className="group">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-mist/40 [&::-webkit-details-marker]:hidden">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line bg-mist">
                          {brand.logo_url ? (
                            <Image
                              src={brand.logo_url}
                              alt={brand.name}
                              fill
                              sizes="40px"
                              className="object-contain p-1"
                            />
                          ) : (
                            <BadgeCheck className="size-4 text-muted" />
                          )}
                        </span>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-[13px] font-semibold">{brand.name}</p>
                            {!brand.is_active ? <Badge tone="warning">hidden</Badge> : null}
                          </div>
                          <p className="font-mono text-[10px] text-muted">/{brand.slug}</p>
                        </div>
                      </div>
                      <span className="text-[12px] font-semibold text-violet">Edit</span>
                    </summary>
                    <div className="border-t border-line/60 bg-mist/20 px-5 py-4">
                      <ActionForm action={saveBrandAction} className="space-y-3">
                        <input type="hidden" name="id" value={brand.id} />
                        <BrandFields brand={brand} />
                        <div className="flex flex-wrap items-center gap-2">
                          <SubmitButton size="sm" pendingText="Saving…">
                            Save brand
                          </SubmitButton>
                          {user?.role === "admin" ? (
                            <InlineButton
                              action={deleteBrandAction.bind(null, brand.id)}
                              variant="danger-ghost"
                              size="sm"
                              confirm={`Delete ${brand.name}? Products stay but lose the brand link.`}
                              pendingText="Deleting…"
                            >
                              <Trash2 /> Delete
                            </InlineButton>
                          ) : null}
                        </div>
                      </ActionForm>
                    </div>
                  </details>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-10 text-center text-[13px] text-muted">
              No brands yet. Create the first one on the right.
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-line bg-white p-5">
          <h2 className="flex items-center gap-2 font-display text-base font-semibold">
            <Plus className="size-4 text-violet" /> New brand
          </h2>
          <p className="mt-1 text-xs text-muted">
            Brands appear on the brands page and as a catalog filter.
          </p>
          <ActionForm action={saveBrandAction} resetOnSuccess className="mt-4 space-y-3">
            <BrandFields />
            <SubmitButton size="sm" pendingText="Creating…">
              Create brand
            </SubmitButton>
          </ActionForm>
        </section>
      </div>
    </div>
  );
}
