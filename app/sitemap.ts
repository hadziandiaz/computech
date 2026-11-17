import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/constants";
import { getBrands } from "@/lib/data/brands";
import { getCategories } from "@/lib/data/categories";
import { getProducts } from "@/lib/data/products";
import { getActivePromotions } from "@/lib/data/promotions";

export const revalidate = 3600;

const STATIC_ROUTES: Array<{ path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }> = [
  { path: "", priority: 1, changeFrequency: "daily" },
  { path: "/products", priority: 0.9, changeFrequency: "daily" },
  { path: "/pc-builder", priority: 0.9, changeFrequency: "weekly" },
  { path: "/laptops", priority: 0.8, changeFrequency: "daily" },
  { path: "/networking", priority: 0.8, changeFrequency: "daily" },
  { path: "/categories", priority: 0.7, changeFrequency: "weekly" },
  { path: "/brands", priority: 0.7, changeFrequency: "weekly" },
  { path: "/promotions", priority: 0.8, changeFrequency: "daily" },
  { path: "/compare", priority: 0.5, changeFrequency: "weekly" },
  { path: "/about", priority: 0.5, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.5, changeFrequency: "monthly" },
  { path: "/faq", priority: 0.4, changeFrequency: "monthly" },
  { path: "/warranty", priority: 0.4, changeFrequency: "monthly" },
  { path: "/shipping", priority: 0.4, changeFrequency: "monthly" },
  { path: "/track-order", priority: 0.4, changeFrequency: "monthly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
];

async function allActiveProducts() {
  const collected = [];
  let page = 1;
  while (page <= 20) {
    const result = await getProducts({ status: "active", page, perPage: 60, includePromotions: false });
    collected.push(...result.products);
    if (page >= result.pageCount) break;
    page += 1;
  }
  return collected;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url.replace(/\/$/, "");
  const now = new Date();

  const [products, categories, brands, promotions] = await Promise.all([
    allActiveProducts(),
    getCategories(true),
    getBrands(true),
    getActivePromotions(),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${base}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${base}/products/${product.slug}`,
    lastModified: product.updated_at ? new Date(product.updated_at) : now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const categoryEntries: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${base}/categories/${category.slug}`,
    lastModified: category.updated_at ? new Date(category.updated_at) : now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const brandEntries: MetadataRoute.Sitemap = brands.map((brand) => ({
    url: `${base}/brands/${brand.slug}`,
    lastModified: brand.updated_at ? new Date(brand.updated_at) : now,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  const promotionEntries: MetadataRoute.Sitemap = promotions.map((promotion) => ({
    url: `${base}/promotions/${promotion.slug}`,
    lastModified: promotion.updated_at ? new Date(promotion.updated_at) : now,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  return [
    ...staticEntries,
    ...productEntries,
    ...categoryEntries,
    ...brandEntries,
    ...promotionEntries,
  ];
}
