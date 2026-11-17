import { productUnitPrice } from "@/lib/pricing";
import type {
  Brand,
  Category,
  PcComponentSpec,
  Product,
  ProductImage,
  ProductInventory,
  ProductSpecification,
} from "@/types/domain";

export const PRODUCT_SELECT = `
  *,
  brand:brands(*),
  category:categories(*),
  images:product_images(*),
  inventory:product_inventory(*),
  pc_spec:pc_component_specs(*)
`;

export const PRODUCT_CARD_SELECT = `
  id, name, slug, sku, brand_id, category_id, short_description,
  price, discount_price, warranty_months, warranty_type, warranty_provider,
  weight_grams, status, is_featured, is_demo, sold_count, rating, review_count,
  created_at, updated_at,
  brand:brands(id, name, slug, logo_url),
  category:categories(id, name, slug),
  images:product_images(id, product_id, url, alt, sort_order, is_primary),
  inventory:product_inventory(product_id, stock, reserved, low_stock_threshold),
  pc_spec:pc_component_specs(*)
`;

function first<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export function mapProduct(row: any): Product {
  const images = ((row.images ?? []) as ProductImage[]).sort(
    (a, b) => a.sort_order - b.sort_order,
  );
  const inventory = first<ProductInventory>(row.inventory);
  const pcSpec = first<PcComponentSpec>(row.pc_spec);
  const product: Product = {
    ...row,
    brand: first<Brand>(row.brand),
    category: first<Category>(row.category),
    images,
    inventory,
    pc_spec: pcSpec,
    specifications: (row.specifications ?? []) as ProductSpecification[],
  };
  product.effective_price = productUnitPrice(product);
  return product;
}

export function mapProducts(rows: any[] | null | undefined): Product[] {
  return (rows ?? []).map(mapProduct);
}

export function primaryImage(product: Pick<Product, "images" | "name">) {
  const images = product.images ?? [];
  return images.find((image) => image.is_primary)?.url ?? images[0]?.url ?? null;
}

export function inStock(product: Pick<Product, "inventory" | "status">) {
  return (
    product.status === "active" &&
    (product.inventory?.stock ?? 0) > 0
  );
}

export function stockOf(product: Pick<Product, "inventory">) {
  return product.inventory?.stock ?? 0;
}
