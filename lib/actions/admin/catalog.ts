"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  actionAdmin,
  actionStaff,
  checkbox,
  fail,
  fieldErrors,
  firstZodMessage,
  numberValue,
  ok,
  optionalNumber,
  optionalText,
  text,
} from "@/lib/actions/helpers";
import type { ActionResult } from "@/lib/actions/types";
import {
  PRODUCT_IMAGE_BUCKET,
  productImagePathFromUrl,
} from "@/lib/storage/product-images";
import { slugify } from "@/lib/utils";
import { tryCreateSupabaseServerClient } from "@/lib/supabase/server";

const productStatuses = ["draft", "active", "archived", "out_of_stock"] as const;
const warrantyTypes = ["manufacturer", "distributor", "store", "none"] as const;
const componentTypes = [
  "cpu",
  "motherboard",
  "gpu",
  "ram",
  "storage",
  "psu",
  "case",
  "cooler",
  "case_fan",
] as const;

const productSchema = z.object({
  name: z.string().trim().min(2, "Enter a product name.").max(200),
  slug: z.string().trim().max(120).optional().or(z.literal("")),
  sku: z.string().trim().min(2, "Enter a SKU.").max(60),
  brand_id: z.string().uuid().optional().or(z.literal("")),
  category_id: z.string().uuid().optional().or(z.literal("")),
  short_description: z.string().trim().max(300).optional().or(z.literal("")),
  description: z.string().trim().max(20000).optional().or(z.literal("")),
  price: z.coerce.number().int().min(0, "Price cannot be negative."),
  discount_price: z.coerce.number().int().min(0).nullable(),
  warranty_months: z.coerce.number().int().min(0).max(120),
  warranty_type: z.enum(warrantyTypes),
  warranty_provider: z.string().trim().max(120).optional().or(z.literal("")),
  weight_grams: z.coerce.number().int().min(0),
  status: z.enum(productStatuses),
  is_featured: z.boolean(),
  meta_title: z.string().trim().max(160).optional().or(z.literal("")),
  meta_description: z.string().trim().max(320).optional().or(z.literal("")),
  stock: z.coerce.number().int().min(0),
  low_stock_threshold: z.coerce.number().int().min(0),
});

function parseSpecs(raw: string) {
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [name, ...rest] = line.split(/\s*[|:]\s*/);
      return {
        name: name?.slice(0, 120) ?? `Spec ${index + 1}`,
        value: rest.join(": ").slice(0, 500),
        group_name: null as string | null,
        sort_order: index,
      };
    })
    .filter((spec) => spec.name && spec.value);
}

function parseImageUrls(raw: string) {
  return raw
    .split(/[\r?\n,]+/)
    .map((url) => url.trim())
    .filter((url) => /^https?:\/\//i.test(url))
    .slice(0, 10);
}

export async function saveProductAction(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const staff = await actionStaff();
  if (!staff) return fail("Staff access is required.", "forbidden");

  const price = numberValue(formData, "price");
  const discountRaw = optionalNumber(formData, "discount_price");
  const discountPrice =
    discountRaw != null && discountRaw > 0 ? Math.min(discountRaw, price) : null;

  const parsed = productSchema.safeParse({
    name: text(formData, "name"),
    slug: text(formData, "slug"),
    sku: text(formData, "sku").toUpperCase(),
    brand_id: text(formData, "brand_id"),
    category_id: text(formData, "category_id"),
    short_description: text(formData, "short_description"),
    description: text(formData, "description"),
    price,
    discount_price: discountPrice,
    warranty_months: numberValue(formData, "warranty_months"),
    warranty_type: text(formData, "warranty_type") || "manufacturer",
    warranty_provider: text(formData, "warranty_provider"),
    weight_grams: numberValue(formData, "weight_grams"),
    status: text(formData, "status") || "active",
    is_featured: checkbox(formData, "is_featured"),
    meta_title: text(formData, "meta_title"),
    meta_description: text(formData, "meta_description"),
    stock: numberValue(formData, "stock"),
    low_stock_threshold: numberValue(formData, "low_stock_threshold", 5),
  });
  if (!parsed.success) {
    return fail(firstZodMessage(parsed.error), "error", fieldErrors(parsed.error));
  }

  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return fail("Supabase is not configured.", "not_configured");

  const id = text(formData, "id");
  const slug = slugify(parsed.data.slug || parsed.data.name);
  if (!slug) return fail("The slug could not be generated.", "error", { name: ["Use letters or numbers."] });

  const payload = {
    name: parsed.data.name,
    slug,
    sku: parsed.data.sku,
    brand_id: parsed.data.brand_id || null,
    category_id: parsed.data.category_id || null,
    short_description: parsed.data.short_description || null,
    description: parsed.data.description || null,
    price: parsed.data.price,
    discount_price: parsed.data.discount_price,
    warranty_months: parsed.data.warranty_months,
    warranty_type: parsed.data.warranty_type,
    warranty_provider: parsed.data.warranty_provider || null,
    weight_grams: parsed.data.weight_grams,
    status: parsed.data.status,
    is_featured: parsed.data.is_featured,
    meta_title: parsed.data.meta_title || null,
    meta_description: parsed.data.meta_description || null,
  };

  let productId = id;
  if (id) {
    const { error } = await supabase.from("products").update(payload).eq("id", id);
    if (error) return fail(error.message);
  } else {
    const { data, error } = await supabase
      .from("products")
      .insert({ ...payload, is_demo: false })
      .select("id")
      .maybeSingle();
    if (error || !data) return fail(error?.message ?? "Could not create the product.");
    productId = data.id;
  }

  if (!productId) return fail("Could not save the product.");

  const { error: inventoryError } = await supabase.from("product_inventory").upsert(
    {
      product_id: productId,
      stock: parsed.data.stock,
      low_stock_threshold: parsed.data.low_stock_threshold,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "product_id" },
  );
  if (inventoryError) return fail(inventoryError.message);

  const imageUrls = parseImageUrls(text(formData, "image_urls"));
  const { data: previousImages } = await supabase
    .from("product_images")
    .select("url")
    .eq("product_id", productId);

  await supabase.from("product_images").delete().eq("product_id", productId);
  if (imageUrls.length) {
    await supabase.from("product_images").insert(
      imageUrls.map((url, index) => ({
        product_id: productId,
        url,
        alt: parsed.data.name,
        sort_order: index,
        is_primary: index === 0,
      })),
    );
  }

  // Remove Storage objects that are no longer referenced after the save.
  // Best-effort: a cleanup failure must not roll back a valid catalog update.
  const removedPaths = ((previousImages ?? []) as Array<{ url: string }>)
    .map((image) => image.url)
    .filter((url) => !imageUrls.includes(url))
    .map(productImagePathFromUrl)
    .filter((path): path is string => Boolean(path));
  if (removedPaths.length) {
    try {
      await supabase.storage.from(PRODUCT_IMAGE_BUCKET).remove(removedPaths);
    } catch (error) {
      console.error("Product image cleanup failed", error);
    }
  }

  const specs = parseSpecs(text(formData, "specifications"));
  await supabase.from("product_specifications").delete().eq("product_id", productId);
  if (specs.length) {
    await supabase.from("product_specifications").insert(
      specs.map((spec) => ({ ...spec, product_id: productId })),
    );
  }

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/products");
  revalidatePath(`/products/${slug}`);

  return {
    ...ok(id ? "Product updated." : "Product created.", { id: productId }),
    redirectTo: `/admin/products/${productId}`,
  };
}

export async function archiveProductAction(productId: string): Promise<ActionResult> {
  const staff = await actionStaff();
  if (!staff) return fail("Staff access is required.", "forbidden");
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return fail("Supabase is not configured.", "not_configured");

  const { error } = await supabase
    .from("products")
    .update({ status: "archived" })
    .eq("id", productId);
  if (error) return fail(error.message);

  revalidatePath("/admin/products");
  revalidatePath("/products");
  return ok("Product archived.");
}

export async function deleteProductAction(productId: string): Promise<ActionResult> {
  const admin = await actionAdmin();
  if (!admin) return fail("Administrator access is required.", "forbidden");
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return fail("Supabase is not configured.", "not_configured");

  const { error } = await supabase.from("products").delete().eq("id", productId);
  if (error) return fail(error.message);

  revalidatePath("/admin/products");
  revalidatePath("/products");
  return ok("Product deleted.");
}

export async function saveCategoryAction(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const staff = await actionStaff();
  if (!staff) return fail("Staff access is required.", "forbidden");
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return fail("Supabase is not configured.", "not_configured");

  const name = text(formData, "name");
  const slug = slugify(text(formData, "slug") || name);
  if (name.length < 2 || !slug) return fail("Enter a category name.");

  const payload = {
    name,
    slug,
    parent_id: optionalText(formData, "parent_id"),
    description: optionalText(formData, "description"),
    image_url: optionalText(formData, "image_url"),
    icon: optionalText(formData, "icon"),
    sort_order: numberValue(formData, "sort_order"),
    is_active: checkbox(formData, "is_active"),
  };

  const id = text(formData, "id");

  if (id) {
    if (payload.parent_id === id) return fail("A category cannot be its own parent.");
    const { error } = await supabase.from("categories").update(payload).eq("id", id);
    if (error) return fail(error.message);
    revalidatePath("/admin/categories");
    revalidatePath("/categories");
    return ok("Category updated.", { id });
  }

  const { data, error } = await supabase
    .from("categories")
    .insert(payload)
    .select("id")
    .maybeSingle();
  if (error || !data) return fail(error?.message ?? "Could not create the category.");

  revalidatePath("/admin/categories");
  revalidatePath("/categories");
  return ok("Category created.", { id: data.id });
}

export async function deleteCategoryAction(categoryId: string): Promise<ActionResult> {
  const admin = await actionAdmin();
  if (!admin) return fail("Administrator access is required.", "forbidden");
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return fail("Supabase is not configured.", "not_configured");
  const { error } = await supabase.from("categories").delete().eq("id", categoryId);
  if (error) return fail(error.message);
  revalidatePath("/admin/categories");
  revalidatePath("/categories");
  return ok("Category deleted. Products were kept and are now uncategorised.");
}

export async function saveBrandAction(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const staff = await actionStaff();
  if (!staff) return fail("Staff access is required.", "forbidden");
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return fail("Supabase is not configured.", "not_configured");

  const name = text(formData, "name");
  const slug = slugify(text(formData, "slug") || name);
  if (name.length < 2 || !slug) return fail("Enter a brand name.");

  const payload = {
    name,
    slug,
    logo_url: optionalText(formData, "logo_url"),
    description: optionalText(formData, "description"),
    is_active: checkbox(formData, "is_active"),
  };

  const id = text(formData, "id");
  if (id) {
    const { error } = await supabase.from("brands").update(payload).eq("id", id);
    if (error) return fail(error.message);
    revalidatePath("/admin/brands");
    revalidatePath("/brands");
    return ok("Brand updated.", { id });
  }

  const { data, error } = await supabase.from("brands").insert(payload).select("id").maybeSingle();
  if (error || !data) return fail(error?.message ?? "Could not create the brand.");
  revalidatePath("/admin/brands");
  revalidatePath("/brands");
  return ok("Brand created.", { id: data.id });
}

export async function deleteBrandAction(brandId: string): Promise<ActionResult> {
  const admin = await actionAdmin();
  if (!admin) return fail("Administrator access is required.", "forbidden");
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return fail("Supabase is not configured.", "not_configured");
  const { error } = await supabase.from("brands").delete().eq("id", brandId);
  if (error) return fail(error.message);
  revalidatePath("/admin/brands");
  revalidatePath("/brands");
  return ok("Brand deleted.");
}

function intOrNull(formData: FormData, key: string) {
  const value = optionalNumber(formData, key);
  return value == null ? null : Math.round(value);
}

function arrayOrNull(formData: FormData, key: string) {
  const raw = text(formData, key);
  if (!raw.trim()) return null;
  return raw
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

const pcSpecSchema = z.object({
  product_id: z.string().uuid("Choose a product."),
  component_type: z.enum(componentTypes),
  socket: z.string().trim().max(40).optional().or(z.literal("")),
  chipset: z.string().trim().max(40).optional().or(z.literal("")),
  memory_type: z.string().trim().max(30).optional().or(z.literal("")),
  form_factor: z.string().trim().max(30).optional().or(z.literal("")),
  gpu_power_connectors: z.string().trim().max(60).optional().or(z.literal("")),
  efficiency: z.string().trim().max(40).optional().or(z.literal("")),
  storage_interface: z.string().trim().max(40).optional().or(z.literal("")),
  notes: z.string().trim().max(300).optional().or(z.literal("")),
  integrated_graphics: z.boolean(),
});

export async function savePcSpecAction(formData: FormData): Promise<ActionResult> {
  const staff = await actionStaff();
  if (!staff) return fail("Staff access is required.", "forbidden");

  const parsed = pcSpecSchema.safeParse({
    product_id: text(formData, "product_id"),
    component_type: text(formData, "component_type"),
    socket: text(formData, "socket"),
    chipset: text(formData, "chipset"),
    memory_type: text(formData, "memory_type"),
    form_factor: text(formData, "form_factor"),
    gpu_power_connectors: text(formData, "gpu_power_connectors"),
    efficiency: text(formData, "efficiency"),
    storage_interface: text(formData, "storage_interface"),
    notes: text(formData, "notes"),
    integrated_graphics: checkbox(formData, "integrated_graphics"),
  });
  if (!parsed.success) {
    return fail(firstZodMessage(parsed.error), "error", fieldErrors(parsed.error));
  }

  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return fail("Supabase is not configured.", "not_configured");

  const payload = {
    product_id: parsed.data.product_id,
    component_type: parsed.data.component_type,
    socket: parsed.data.socket || null,
    chipset: parsed.data.chipset || null,
    tdp_watt: intOrNull(formData, "tdp_watt"),
    cores: intOrNull(formData, "cores"),
    integrated_graphics: parsed.data.integrated_graphics,
    memory_type: parsed.data.memory_type || null,
    memory_slots: intOrNull(formData, "memory_slots"),
    max_memory_gb: intOrNull(formData, "max_memory_gb"),
    form_factor: parsed.data.form_factor || null,
    supported_form_factors: arrayOrNull(formData, "supported_form_factors"),
    m2_slots: intOrNull(formData, "m2_slots"),
    sata_ports: intOrNull(formData, "sata_ports"),
    gpu_length_mm: intOrNull(formData, "gpu_length_mm"),
    gpu_tdp: intOrNull(formData, "gpu_tdp"),
    gpu_power_connectors: parsed.data.gpu_power_connectors || null,
    recommended_psu_watt: intOrNull(formData, "recommended_psu_watt"),
    wattage: intOrNull(formData, "wattage"),
    efficiency: parsed.data.efficiency || null,
    pcie_8pin_connectors: intOrNull(formData, "pcie_8pin_connectors"),
    pcie_16pin_connectors: intOrNull(formData, "pcie_16pin_connectors"),
    max_gpu_length_mm: intOrNull(formData, "max_gpu_length_mm"),
    max_cooler_height_mm: intOrNull(formData, "max_cooler_height_mm"),
    fan_mount_sizes: arrayOrNull(formData, "fan_mount_sizes"),
    cooler_height_mm: intOrNull(formData, "cooler_height_mm"),
    cooler_sockets: arrayOrNull(formData, "cooler_sockets"),
    cooler_tdp_rating: intOrNull(formData, "cooler_tdp_rating"),
    ram_modules: intOrNull(formData, "ram_modules"),
    ram_capacity_gb: intOrNull(formData, "ram_capacity_gb"),
    ram_speed_mhz: intOrNull(formData, "ram_speed_mhz"),
    storage_interface: parsed.data.storage_interface || null,
    storage_capacity_gb: intOrNull(formData, "storage_capacity_gb"),
    performance_score: optionalNumber(formData, "performance_score"),
    notes: parsed.data.notes || null,
  };

  const { error } = await supabase
    .from("pc_component_specs")
    .upsert(payload, { onConflict: "product_id" });
  if (error) return fail(error.message);

  revalidatePath("/admin/pc-components");
  revalidatePath("/pc-builder");
  return ok("PC component specifications saved.");
}
