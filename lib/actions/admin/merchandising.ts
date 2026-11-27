"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
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
import { slugify } from "@/lib/utils";
import { tryCreateSupabaseServerClient } from "@/lib/supabase/server";

const promotionTypes = [
  "flash_sale",
  "product_discount",
  "bundle",
  "voucher",
  "free_shipping",
  "seasonal",
  "special_offer",
  "member_discount",
] as const;
const discountTypes = ["percentage", "fixed"] as const;

function iso(value: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

const promotionSchema = z.object({
  name: z.string().trim().min(2, "Enter a promotion name.").max(160),
  slug: z.string().trim().max(140).optional().or(z.literal("")),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  type: z.enum(promotionTypes),
  discount_type: z.enum(discountTypes),
  discount_value: z.coerce.number().int().min(0),
  start_date: z.string().min(1, "Choose a start date."),
  end_date: z.string().min(1, "Choose an end date."),
  usage_limit: z.coerce.number().int().min(1).nullable(),
  min_purchase: z.coerce.number().int().min(0),
  max_discount: z.coerce.number().int().min(0).nullable(),
  banner_url: z.string().trim().max(500).optional().or(z.literal("")),
  is_active: z.boolean(),
});

export async function savePromotionAction(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const staff = await actionStaff();
  if (!staff) return fail("Staff access is required.", "forbidden");

  const start = iso(text(formData, "start_date"));
  const end = iso(text(formData, "end_date"));
  if (!start || !end) {
    return fail("Enter a valid start and end date.", "error", {
      start_date: ["Enter a valid start date."],
      end_date: ["Enter a valid end date."],
    });
  }
  if (new Date(end) <= new Date(start)) {
    return fail("The end date must be after the start date.", "error", {
      end_date: ["End date must be after the start date."],
    });
  }

  const parsed = promotionSchema.safeParse({
    name: text(formData, "name"),
    slug: text(formData, "slug"),
    description: text(formData, "description"),
    type: text(formData, "type") || "seasonal",
    discount_type: text(formData, "discount_type") || "percentage",
    discount_value: numberValue(formData, "discount_value"),
    start_date: start,
    end_date: end,
    usage_limit: optionalNumber(formData, "usage_limit"),
    min_purchase: numberValue(formData, "min_purchase"),
    max_discount: optionalNumber(formData, "max_discount"),
    banner_url: text(formData, "banner_url"),
    is_active: checkbox(formData, "is_active"),
  });
  if (!parsed.success) {
    return fail(firstZodMessage(parsed.error), "error", fieldErrors(parsed.error));
  }
  if (parsed.data.discount_type === "percentage" && parsed.data.discount_value > 100) {
    return fail("Percentage discounts cannot exceed 100.", "error", {
      discount_value: ["Enter a value between 0 and 100."],
    });
  }

  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return fail("Supabase is not configured.", "not_configured");

  const slug = slugify(parsed.data.slug || parsed.data.name);
  if (!slug) return fail("Enter a valid promotion name.");

  const payload = {
    name: parsed.data.name,
    slug,
    description: parsed.data.description || null,
    type: parsed.data.type,
    discount_type: parsed.data.discount_type,
    discount_value: parsed.data.discount_value,
    start_date: parsed.data.start_date,
    end_date: parsed.data.end_date,
    usage_limit: parsed.data.usage_limit,
    min_purchase: parsed.data.min_purchase,
    max_discount: parsed.data.max_discount,
    banner_url: parsed.data.banner_url || null,
    is_active: parsed.data.is_active,
  };

  const id = text(formData, "id");
  let promotionId = id;
  if (id) {
    const { error } = await supabase.from("promotions").update(payload).eq("id", id);
    if (error) return fail(error.message);
  } else {
    const { data, error } = await supabase
      .from("promotions")
      .insert(payload)
      .select("id")
      .maybeSingle();
    if (error || !data) return fail(error?.message ?? "Could not create the promotion.");
    promotionId = data.id;
  }
  if (!promotionId) return fail("Could not save the promotion.");

  const productIds = formData
    .getAll("product_ids")
    .filter((value): value is string => typeof value === "string" && value.length === 36);

  await supabase.from("promotion_products").delete().eq("promotion_id", promotionId);
  if (productIds.length) {
    await supabase.from("promotion_products").insert(
      productIds.map((productId) => ({
        promotion_id: promotionId,
        product_id: productId,
        discount_type: null,
        discount_value: null,
      })),
    );
  }

  revalidatePath("/admin/promotions");
  revalidatePath("/promotions");
  revalidatePath("/products");
  revalidatePath("/");
  return ok(id ? "Promotion updated." : "Promotion created.", { id: promotionId });
}

export async function deletePromotionAction(promotionId: string): Promise<ActionResult> {
  const staff = await actionStaff();
  if (!staff) return fail("Staff access is required.", "forbidden");
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return fail("Supabase is not configured.", "not_configured");
  const { error } = await supabase.from("promotions").delete().eq("id", promotionId);
  if (error) return fail(error.message);
  revalidatePath("/admin/promotions");
  revalidatePath("/promotions");
  return ok("Promotion deleted.");
}

const voucherSchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .min(3, "Code must be at least 3 characters.")
    .max(40)
    .regex(/^[A-Z0-9_-]+$/, "Use letters, numbers, hyphen or underscore."),
  name: z.string().trim().min(2, "Enter a voucher name.").max(120),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  discount_type: z.enum(discountTypes),
  discount_value: z.coerce.number().int().min(1, "Discount must be greater than zero."),
  min_purchase: z.coerce.number().int().min(0),
  max_discount: z.coerce.number().int().min(0).nullable(),
  starts_at: z.string().min(1),
  expires_at: z.string().nullable(),
  usage_limit: z.coerce.number().int().min(1).nullable(),
  per_user_limit: z.coerce.number().int().min(1),
  is_active: z.boolean(),
});

export async function saveVoucherAction(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const staff = await actionStaff();
  if (!staff) return fail("Staff access is required.", "forbidden");

  const startsAt = iso(text(formData, "starts_at")) ?? new Date().toISOString();
  const expiresRaw = iso(text(formData, "expires_at"));
  if (expiresRaw && new Date(expiresRaw) <= new Date(startsAt)) {
    return fail("The expiry must be after the start date.", "error", {
      expires_at: ["Expiry must be after the start date."],
    });
  }

  const parsed = voucherSchema.safeParse({
    code: text(formData, "code"),
    name: text(formData, "name"),
    description: text(formData, "description"),
    discount_type: text(formData, "discount_type") || "fixed",
    discount_value: numberValue(formData, "discount_value"),
    min_purchase: numberValue(formData, "min_purchase"),
    max_discount: optionalNumber(formData, "max_discount"),
    starts_at: startsAt,
    expires_at: expiresRaw,
    usage_limit: optionalNumber(formData, "usage_limit"),
    per_user_limit: numberValue(formData, "per_user_limit", 1),
    is_active: checkbox(formData, "is_active"),
  });
  if (!parsed.success) {
    return fail(firstZodMessage(parsed.error), "error", fieldErrors(parsed.error));
  }
  if (parsed.data.discount_type === "percentage" && parsed.data.discount_value > 100) {
    return fail("Percentage discounts cannot exceed 100.", "error", {
      discount_value: ["Enter a value between 1 and 100."],
    });
  }

  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return fail("Supabase is not configured.", "not_configured");

  const payload = {
    code: parsed.data.code,
    name: parsed.data.name,
    description: parsed.data.description || null,
    discount_type: parsed.data.discount_type,
    discount_value: parsed.data.discount_value,
    min_purchase: parsed.data.min_purchase,
    max_discount: parsed.data.max_discount,
    starts_at: parsed.data.starts_at,
    expires_at: parsed.data.expires_at,
    usage_limit: parsed.data.usage_limit,
    per_user_limit: parsed.data.per_user_limit,
    is_active: parsed.data.is_active,
  };

  const id = text(formData, "id");
  if (id) {
    const { error } = await supabase.from("vouchers").update(payload).eq("id", id);
    if (error) return fail(error.message);
    revalidatePath("/admin/vouchers");
    revalidatePath("/account/vouchers");
    return ok("Voucher updated.", { id });
  }

  const { data, error } = await supabase
    .from("vouchers")
    .insert(payload)
    .select("id")
    .maybeSingle();
  if (error || !data) return fail(error?.message ?? "Could not create the voucher.");
  revalidatePath("/admin/vouchers");
  revalidatePath("/account/vouchers");
  return ok("Voucher created.", { id: data.id });
}

export async function deleteVoucherAction(voucherId: string): Promise<ActionResult> {
  const staff = await actionStaff();
  if (!staff) return fail("Staff access is required.", "forbidden");
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return fail("Supabase is not configured.", "not_configured");
  const { error } = await supabase.from("vouchers").delete().eq("id", voucherId);
  if (error) return fail(error.message);
  revalidatePath("/admin/vouchers");
  return ok("Voucher deleted.");
}

export async function saveShippingMethodAction(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const staff = await actionStaff();
  if (!staff) return fail("Staff access is required.", "forbidden");
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return fail("Supabase is not configured.", "not_configured");

  const name = text(formData, "name");
  const courier = text(formData, "courier");
  if (name.length < 2 || courier.length < 2) {
    return fail("Enter a method name and courier.");
  }

  const payload = {
    name,
    courier,
    description: optionalText(formData, "description"),
    cost: numberValue(formData, "cost"),
    estimated_days: text(formData, "estimated_days") || "2-4 days",
    is_active: checkbox(formData, "is_active"),
    sort_order: numberValue(formData, "sort_order"),
  };

  const id = text(formData, "id");
  if (id) {
    const { error } = await supabase.from("shipping_methods").update(payload).eq("id", id);
    if (error) return fail(error.message);
    revalidatePath("/admin/settings");
    revalidatePath("/checkout");
    return ok("Shipping method updated.", { id });
  }
  const { data, error } = await supabase
    .from("shipping_methods")
    .insert(payload)
    .select("id")
    .maybeSingle();
  if (error || !data) return fail(error?.message ?? "Could not create the method.");
  revalidatePath("/admin/settings");
  revalidatePath("/checkout");
  return ok("Shipping method created.", { id: data.id });
}

export async function deleteShippingMethodAction(id: string): Promise<ActionResult> {
  const staff = await actionStaff();
  if (!staff) return fail("Staff access is required.", "forbidden");
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return fail("Supabase is not configured.", "not_configured");
  const { error } = await supabase.from("shipping_methods").delete().eq("id", id);
  if (error) return fail(error.message);
  revalidatePath("/admin/settings");
  revalidatePath("/checkout");
  return ok("Shipping method deleted.");
}

function parseMatchers(raw: string): string[] {
  return Array.from(
    new Set(
      raw
        .split(/[,\n]/)
        .map((token) => token.trim().toLocaleLowerCase("id-ID"))
        .filter(Boolean),
    ),
  ).slice(0, 30);
}

export async function saveShippingZoneAction(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const staff = await actionStaff();
  if (!staff) return fail("Staff access is required.", "forbidden");

  const name = text(formData, "name");
  if (name.length < 2) return fail("Enter a zone name.");

  const code = slugify(text(formData, "code") || name);
  if (!code) return fail("Enter a valid zone code.");

  const payload = {
    code,
    name,
    description: optionalText(formData, "description"),
    matchers: parseMatchers(text(formData, "matchers")),
    is_active: checkbox(formData, "is_active"),
    sort_order: numberValue(formData, "sort_order"),
  };

  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return fail("Supabase is not configured.", "not_configured");

  const id = text(formData, "id");
  let zoneId = id;
  if (id) {
    const { error } = await supabase.from("shipping_zones").update(payload).eq("id", id);
    if (error) return fail(error.message);
  } else {
    const { data, error } = await supabase
      .from("shipping_zones")
      .insert(payload)
      .select("id")
      .maybeSingle();
    if (error || !data) return fail(error?.message ?? "Could not create the zone.");
    zoneId = data.id;
  }
  if (!zoneId) return fail("Could not save the zone.");

  const rates = Array.from(formData.entries())
    .filter(
      ([key, value]) =>
        key.startsWith("rate_") &&
        /^[0-9a-f-]{36}$/i.test(key.slice(5)) &&
        typeof value === "string",
    )
    .map(([key, value]) => ({
      zone_id: zoneId,
      method_id: key.slice(5),
      cost: Math.max(0, Math.round(Number(value) || 0)),
    }));

  await supabase.from("shipping_zone_rates").delete().eq("zone_id", zoneId);
  if (rates.length) {
    const { error } = await supabase.from("shipping_zone_rates").insert(rates);
    if (error) return fail(error.message);
  }

  revalidatePath("/admin/settings");
  revalidatePath("/checkout");
  return ok(id ? "Shipping zone updated." : "Shipping zone created.", { id: zoneId });
}

export async function deleteShippingZoneAction(id: string): Promise<ActionResult> {
  const staff = await actionStaff();
  if (!staff) return fail("Staff access is required.", "forbidden");
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return fail("Supabase is not configured.", "not_configured");
  const { error } = await supabase.from("shipping_zones").delete().eq("id", id);
  if (error) return fail(error.message);
  revalidatePath("/admin/settings");
  revalidatePath("/checkout");
  return ok("Shipping zone deleted. Existing orders keep their shipping cost.");
}
