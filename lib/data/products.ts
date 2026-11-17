import "server-only";

import { getDescendantCategoryIds } from "@/lib/data/categories";
import {
  PRODUCT_CARD_SELECT,
  PRODUCT_SELECT,
  mapProduct,
  mapProducts,
} from "@/lib/data/mappers";
import { applyPromotions, getActivePromotions } from "@/lib/data/promotions";
import { tryCreateSupabaseServerClient } from "@/lib/supabase/server";
import type { Product, ProductStatus } from "@/types/domain";

export type ProductSort =
  | "featured"
  | "newest"
  | "price-asc"
  | "price-desc"
  | "rating"
  | "popular";

export interface ProductQuery {
  q?: string;
  categorySlug?: string;
  categoryId?: string;
  brandSlug?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: ProductSort;
  page?: number;
  perPage?: number;
  featured?: boolean;
  inStock?: boolean;
  status?: ProductStatus | "all";
  ids?: string[];
  excludeIds?: string[];
  includePromotions?: boolean;
}

export interface ProductPage {
  products: Product[];
  total: number;
  page: number;
  perPage: number;
  pageCount: number;
}

const SORTS: Record<ProductSort, Array<[string, { ascending: boolean }]>> = {
  featured: [
    ["is_featured", { ascending: false }],
    ["sold_count", { ascending: false }],
  ],
  newest: [["created_at", { ascending: false }]],
  "price-asc": [["price", { ascending: true }]],
  "price-desc": [["price", { ascending: false }]],
  rating: [
    ["rating", { ascending: false }],
    ["review_count", { ascending: false }],
  ],
  popular: [["sold_count", { ascending: false }]],
};

function sanitizeSearch(value: string) {
  return value.replace(/[,%()*\\]/g, " ").trim();
}

export async function getProducts(query: ProductQuery = {}): Promise<ProductPage> {
  const page = Math.max(1, query.page ?? 1);
  const perPage = Math.min(60, Math.max(1, query.perPage ?? 12));
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) {
    return { products: [], total: 0, page, perPage, pageCount: 0 };
  }

  let builder = supabase
    .from("products")
    .select(PRODUCT_CARD_SELECT, { count: "exact" });

  const status = query.status ?? "active";
  if (status !== "all") builder = builder.eq("status", status);

  if (query.ids?.length) builder = builder.in("id", query.ids);
  if (query.excludeIds?.length) builder = builder.not("id", "in", `(${query.excludeIds.join(",")})`);
  if (query.featured) builder = builder.eq("is_featured", true);
  if (query.minPrice != null) builder = builder.gte("price", query.minPrice);
  if (query.maxPrice != null) builder = builder.lte("price", query.maxPrice);

  if (query.categoryId) {
    builder = builder.eq("category_id", query.categoryId);
  } else if (query.categorySlug) {
    const categoryIds = await getDescendantCategoryIds(query.categorySlug);
    builder = builder.in("category_id", categoryIds.length ? categoryIds : ["00000000-0000-0000-0000-000000000000"]);
  }

  if (query.brandSlug) {
    const { data: brand } = await supabase
      .from("brands")
      .select("id")
      .eq("slug", query.brandSlug)
      .maybeSingle();
    builder = builder.eq("brand_id", brand?.id ?? "00000000-0000-0000-0000-000000000000");
  }

  if (query.q) {
    const term = sanitizeSearch(query.q);
    if (term) {
      builder = builder.or(
        `name.ilike.%${term}%,sku.ilike.%${term}%,short_description.ilike.%${term}%`,
      );
    }
  }

  for (const [column, options] of SORTS[query.sort ?? "featured"]) {
    builder = builder.order(column, options);
  }

  const from = (page - 1) * perPage;
  const { data, error, count } = await builder.range(from, from + perPage - 1);
  if (error || !data) {
    return { products: [], total: 0, page, perPage, pageCount: 0 };
  }

  let products = mapProducts(data);
  if (query.inStock) {
    products = products.filter((product) => (product.inventory?.stock ?? 0) > 0);
  }
  if (query.includePromotions !== false) {
    products = applyPromotions(products, await getActivePromotions());
  }

  const total = count ?? products.length;
  return {
    products,
    total,
    page,
    perPage,
    pageCount: Math.max(1, Math.ceil(total / perPage)),
  };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .maybeSingle();
  if (error || !data) return null;

  const [{ data: specs }, promotions] = await Promise.all([
    supabase
      .from("product_specifications")
      .select("*")
      .eq("product_id", data.id)
      .order("sort_order", { ascending: true }),
    getActivePromotions(),
  ]);

  const product = mapProduct({ ...data, specifications: specs ?? [] });
  return applyPromotions([product], promotions)[0] ?? product;
}

export async function getProductById(id: string): Promise<Product | null> {
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  const [{ data: specs }, promotions] = await Promise.all([
    supabase
      .from("product_specifications")
      .select("*")
      .eq("product_id", id)
      .order("sort_order", { ascending: true }),
    getActivePromotions(),
  ]);
  const product = mapProduct({ ...data, specifications: specs ?? [] });
  return applyPromotions([product], promotions)[0] ?? product;
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (!ids.length) return [];
  const page = await getProducts({ ids, perPage: Math.min(60, ids.length) });
  const map = new Map(page.products.map((product) => [product.id, product]));
  return ids.map((id) => map.get(id)).filter((item): item is Product => Boolean(item));
}

export async function getRelatedProducts(
  product: Pick<Product, "id" | "category_id">,
  limit = 4,
): Promise<Product[]> {
  if (!product.category_id) return [];
  const page = await getProducts({
    categoryId: product.category_id,
    perPage: limit + 1,
    excludeIds: [product.id],
  });
  return page.products.slice(0, limit);
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const page = await getProducts({ featured: true, perPage: limit });
  if (page.products.length >= limit) return page.products;
  const fallback = await getProducts({ sort: "popular", perPage: limit });
  const seen = new Set(page.products.map((product) => product.id));
  return [
    ...page.products,
    ...fallback.products.filter((product) => !seen.has(product.id)),
  ].slice(0, limit);
}

export async function getBestSellers(limit = 4): Promise<Product[]> {
  const page = await getProducts({ sort: "popular", perPage: limit });
  return page.products;
}

export async function getNewArrivals(limit = 4): Promise<Product[]> {
  const page = await getProducts({ sort: "newest", perPage: limit });
  return page.products;
}

export async function getPcComponentCatalog(): Promise<Product[]> {
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("status", "active")
    .not("category_id", "is", null)
    .order("name");
  if (error || !data) return [];
  const promotions = await getActivePromotions();
  const products = mapProducts(data).filter(
    (product) => product.pc_spec && (product.inventory?.stock ?? 0) >= 0,
  );
  return applyPromotions(products, promotions);
}

export async function getAdminProducts(query: ProductQuery = {}): Promise<ProductPage> {
  return getProducts({ ...query, status: query.status ?? "all" });
}

export async function getAdminPcComponentProducts(): Promise<Product[]> {
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .order("name");
  if (error || !data) return [];
  return mapProducts(data);
}

export interface CatalogFacet {
  id: string;
  name: string;
  slug: string;
  count: number;
}

export interface CatalogFacets {
  categories: CatalogFacet[];
  brands: CatalogFacet[];
  minPrice: number;
  maxPrice: number;
}

export async function getCatalogFacets(): Promise<CatalogFacets> {
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return { categories: [], brands: [], minPrice: 0, maxPrice: 0 };
  const { data, error } = await supabase
    .from("products")
    .select("price, category:categories(id, name, slug), brand:brands(id, name, slug)")
    .eq("status", "active");
  if (error || !data) return { categories: [], brands: [], minPrice: 0, maxPrice: 0 };

  const categories = new Map<string, CatalogFacet>();
  const brands = new Map<string, CatalogFacet>();
  let minPrice = Number.POSITIVE_INFINITY;
  let maxPrice = 0;

  for (const row of data as any[]) {
    const category = Array.isArray(row.category) ? row.category[0] : row.category;
    const brand = Array.isArray(row.brand) ? row.brand[0] : row.brand;
    if (category) {
      const current = categories.get(category.id) ?? { ...category, count: 0 };
      current.count += 1;
      categories.set(category.id, current);
    }
    if (brand) {
      const current = brands.get(brand.id) ?? { ...brand, count: 0 };
      current.count += 1;
      brands.set(brand.id, current);
    }
    minPrice = Math.min(minPrice, row.price);
    maxPrice = Math.max(maxPrice, row.price);
  }

  return {
    categories: Array.from(categories.values()).sort((a, b) => b.count - a.count),
    brands: Array.from(brands.values()).sort((a, b) => a.name.localeCompare(b.name)),
    minPrice: Number.isFinite(minPrice) ? minPrice : 0,
    maxPrice,
  };
}
