import { FolderTree, Pencil, Plus, Trash2 } from "lucide-react";

import { AdminHeader } from "@/components/admin/admin-header";
import { ActionForm, InlineButton, SubmitButton } from "@/components/ui/action-form";
import { Badge } from "@/components/ui/badge";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/input";
import {
  deleteCategoryAction,
  saveCategoryAction,
} from "@/lib/actions/admin/catalog";
import { getAuthUser } from "@/lib/auth";
import { buildCategoryTree, getCategories } from "@/lib/data/categories";
import type { Category } from "@/types/domain";

export const metadata = {
  title: "Categories",
};

function CategoryFields({
  category,
  categories,
}: {
  category?: Category;
  categories: Category[];
}) {
  const key = category?.id ?? "new";
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Field label="Name" htmlFor={`name-${key}`} required>
        <Input id={`name-${key}`} name="name" defaultValue={category?.name} placeholder="Graphics Cards" required />
      </Field>
      <Field label="Slug" htmlFor={`slug-${key}`} hint="Leave blank to generate.">
        <Input id={`slug-${key}`} name="slug" defaultValue={category?.slug} />
      </Field>
      <Field label="Parent category" htmlFor={`parent-${key}`}>
        <Select id={`parent-${key}`} name="parent_id" defaultValue={category?.parent_id ?? ""}>
          <option value="">Top-level category</option>
          {categories
            .filter((item) => item.id !== category?.id)
            .map((item) => (
              <option key={item.id} value={item.id}>
                {item.parent_id ? "— " : ""}
                {item.name}
              </option>
            ))}
        </Select>
      </Field>
      <Field label="Sort order" htmlFor={`sort-${key}`} hint="Lower numbers appear first.">
        <Input
          id={`sort-${key}`}
          name="sort_order"
          type="number"
          min={0}
          defaultValue={category?.sort_order ?? 0}
        />
      </Field>
      <Field label="Image URL" htmlFor={`image-${key}`} className="sm:col-span-2">
        <Input
          id={`image-${key}`}
          name="image_url"
          defaultValue={category?.image_url ?? ""}
          placeholder="https://…"
        />
      </Field>
      <Field label="Description" htmlFor={`description-${key}`} className="sm:col-span-2">
        <Textarea
          id={`description-${key}`}
          name="description"
          rows={2}
          defaultValue={category?.description ?? ""}
        />
      </Field>
      <label className="flex items-center gap-2 text-[12px] sm:col-span-2">
        <Checkbox name="is_active" defaultChecked={category?.is_active ?? true} />
        Visible on the storefront
      </label>
    </div>
  );
}

function flatten(categories: Category[], depth = 0): Array<{ category: Category; depth: number }> {
  const rows: Array<{ category: Category; depth: number }> = [];
  for (const category of categories) {
    rows.push({ category, depth });
    if (category.children?.length) rows.push(...flatten(category.children, depth + 1));
  }
  return rows;
}

export default async function AdminCategoriesPage() {
  const [all, user] = await Promise.all([getCategories(false), getAuthUser()]);
  const rows = flatten(buildCategoryTree(all));

  return (
    <div>
      <AdminHeader
        eyebrow="Catalog"
        title="Categories"
        description="Categories drive the catalog filters, navigation and storefront landing pages. Demo seed categories are editable."
      />

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr] xl:items-start">
        <section className="rounded-2xl border border-line bg-white">
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
            <h2 className="flex items-center gap-2 font-display text-base font-semibold">
              <FolderTree className="size-4 text-violet" /> Category tree
            </h2>
            <Badge tone="neutral">{all.length} total</Badge>
          </div>
          {rows.length ? (
            <ul className="divide-y divide-line">
              {rows.map(({ category, depth }) => (
                <li key={category.id}>
                  <details className="group">
                    <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-mist/40 [&::-webkit-details-marker]:hidden">
                      <div className="min-w-0" style={{ paddingLeft: `${depth * 18}px` }}>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-[13px] font-semibold">{category.name}</p>
                          {category.parent_id ? (
                            <Badge tone="neutral">sub-category</Badge>
                          ) : (
                            <Badge tone="violet">top-level</Badge>
                          )}
                          {!category.is_active ? <Badge tone="warning">hidden</Badge> : null}
                        </div>
                        <p className="font-mono text-[10px] text-muted">
                          /{category.slug} · order {category.sort_order}
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-semibold text-violet">
                        <Pencil className="size-3.5" /> Edit
                      </span>
                    </summary>
                    <div className="border-t border-line/60 bg-mist/20 px-5 py-4">
                      <ActionForm action={saveCategoryAction} className="space-y-3">
                        <input type="hidden" name="id" value={category.id} />
                        <CategoryFields category={category} categories={all} />
                        <div className="flex flex-wrap items-center gap-2">
                          <SubmitButton size="sm" pendingText="Saving…">
                            Save category
                          </SubmitButton>
                          {user?.role === "admin" ? (
                            <InlineButton
                              action={deleteCategoryAction.bind(null, category.id)}
                              variant="danger-ghost"
                              size="sm"
                              confirm={`Delete ${category.name}? Products stay but become uncategorised.`}
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
              No categories yet. Create the first one on the right.
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-line bg-white p-5">
          <h2 className="flex items-center gap-2 font-display text-base font-semibold">
            <Plus className="size-4 text-violet" /> New category
          </h2>
          <p className="mt-1 text-xs text-muted">
            Add a top-level category or nest it under an existing one.
          </p>
          <ActionForm action={saveCategoryAction} resetOnSuccess className="mt-4 space-y-3">
            <CategoryFields categories={all} />
            <SubmitButton size="sm" pendingText="Creating…">
              Create category
            </SubmitButton>
          </ActionForm>
        </section>
      </div>
    </div>
  );
}
