import "server-only";

import { tryCreateSupabaseServerClient } from "@/lib/supabase/server";
import type { Category } from "@/types/domain";

export async function getCategories(activeOnly = true): Promise<Category[]> {
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return [];
  let query = supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (activeOnly) query = query.eq("is_active", true);
  const { data, error } = await query;
  if (error || !data) return [];
  return data as Category[];
}

export function buildCategoryTree(categories: Category[]): Category[] {
  const byId = new Map<string, Category>();
  for (const category of categories) {
    byId.set(category.id, { ...category, children: [] });
  }
  const roots: Category[] = [];
  for (const category of byId.values()) {
    if (category.parent_id && byId.has(category.parent_id)) {
      const parent = byId.get(category.parent_id)!;
      parent.children = parent.children ?? [];
      parent.children.push(category);
    } else {
      roots.push(category);
    }
  }
  const sortRecursive = (list: Category[]) => {
    list.sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
    for (const item of list) sortRecursive(item.children ?? []);
  };
  sortRecursive(roots);
  return roots;
}

export async function getCategoryTree(): Promise<Category[]> {
  return buildCategoryTree(await getCategories());
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  if (error || !data) return null;
  return data as Category;
}

export async function getCategoryBreadcrumb(
  category: Category,
): Promise<Category[]> {
  if (!category.parent_id) return [category];
  const categories = await getCategories();
  const byId = new Map(categories.map((item) => [item.id, item]));
  const chain: Category[] = [category];
  let current = category;
  const seen = new Set<string>([category.id]);
  while (current.parent_id) {
    const parent = byId.get(current.parent_id);
    if (!parent || seen.has(parent.id)) break;
    chain.unshift(parent);
    seen.add(parent.id);
    current = parent;
  }
  return chain;
}

export async function getDescendantCategoryIds(
  slug: string,
): Promise<string[]> {
  const categories = await getCategories();
  const root = categories.find((category) => category.slug === slug);
  if (!root) return [];
  const ids = new Set<string>([root.id]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const category of categories) {
      if (
        category.parent_id &&
        ids.has(category.parent_id) &&
        !ids.has(category.id)
      ) {
        ids.add(category.id);
        changed = true;
      }
    }
  }
  return Array.from(ids);
}

export async function getCategoryDescendantSlugs(slug: string): Promise<string[]> {
  const ids = new Set(await getDescendantCategoryIds(slug));
  const categories = await getCategories();
  return categories.filter((category) => ids.has(category.id)).map((c) => c.slug);
}
