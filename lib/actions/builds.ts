"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  actionUser,
  fail,
  fieldErrors,
  firstZodMessage,
  numberValue,
  ok,
  text,
} from "@/lib/actions/helpers";
import type { ActionResult } from "@/lib/actions/types";
import { ensureCart } from "@/lib/cart/service";
import { pcUsageOptions } from "@/lib/constants";
import { generateShareSlug } from "@/lib/utils";
import { tryCreateSupabaseServerClient } from "@/lib/supabase/server";
import type { PcComponentType } from "@/types/domain";

const usageValues = pcUsageOptions.map((option) => option.value);

const saveBuildSchema = z.object({
  id: z.string().uuid().optional().or(z.literal("")),
  name: z.string().trim().min(1, "Name your build.").max(120, "Name is too long."),
  budget: z.coerce.number().int().min(0).max(1_000_000_000),
  usage: z.enum(usageValues as [string, ...string[]]),
  is_public: z.boolean(),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

export async function saveBuildAction(
  formData: FormData,
): Promise<ActionResult<{ id: string; shareSlug: string }>> {
  const user = await actionUser();
  if (!user) return fail("Sign in to save this build to your account.", "auth");

  const parsed = saveBuildSchema.safeParse({
    id: text(formData, "id"),
    name: text(formData, "name") || "My COMPUTECH Build",
    budget: numberValue(formData, "budget"),
    usage: text(formData, "usage") || "gaming",
    is_public: formData.get("is_public") === "on",
    notes: text(formData, "notes"),
  });
  if (!parsed.success) {
    return fail(firstZodMessage(parsed.error), "error", fieldErrors(parsed.error));
  }

  let items: Array<{ product_id: string; component_type: PcComponentType }> = [];
  try {
    const raw = JSON.parse(text(formData, "items") || "[]");
    if (Array.isArray(raw)) {
      items = raw
        .map((item) => ({
          product_id: String(item?.product_id ?? ""),
          component_type: String(item?.component_type ?? ""),
        }))
        .filter(
          (item) =>
            /^[0-9a-f-]{36}$/i.test(item.product_id) &&
            item.component_type.length > 0,
        ) as Array<{ product_id: string; component_type: PcComponentType }>;
    }
  } catch {
    return fail("The component selection could not be read. Rebuild and try again.");
  }

  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return fail("Supabase is not configured.", "not_configured");

  const seen = new Set<string>();
  const validItems: typeof items = [];
  let total = 0;
  for (const item of items) {
    if (seen.has(item.component_type)) continue;
    const { data: spec } = await supabase
      .from("pc_component_specs")
      .select("product_id, component_type, product:products(id, status)")
      .eq("product_id", item.product_id)
      .maybeSingle();
    if (!spec) continue;
    const product = Array.isArray(spec.product) ? spec.product[0] : spec.product;
    if (!product || product.status !== "active") continue;
    const { data: price } = await supabase.rpc("effective_price", {
      p_product_id: item.product_id,
    });
    seen.add(item.component_type);
    validItems.push({
      product_id: item.product_id,
      component_type: item.component_type,
    });
    total += Number(price ?? 0);
  }

  if (!validItems.length) {
    return fail("Add at least one in-stock component before saving.");
  }

  const payload = {
    user_id: user.id,
    name: parsed.data.name,
    budget: parsed.data.budget,
    usage: parsed.data.usage,
    is_public: parsed.data.is_public,
    total_price: total,
    notes: parsed.data.notes || null,
  };

  let buildId = parsed.data.id;
  let shareSlug = "";

  if (buildId) {
    const { data, error } = await supabase
      .from("pc_builds")
      .update(payload)
      .eq("id", buildId)
      .eq("user_id", user.id)
      .select("id, share_slug")
      .maybeSingle();
    if (error || !data) return fail(error?.message ?? "Build not found.");
    shareSlug = data.share_slug;
    await supabase.from("pc_build_items").delete().eq("build_id", buildId);
  } else {
    const { data, error } = await supabase
      .from("pc_builds")
      .insert({ ...payload, share_slug: generateShareSlug() })
      .select("id, share_slug")
      .maybeSingle();
    if (error || !data) return fail(error?.message ?? "Could not save the build.");
    buildId = data.id;
    shareSlug = data.share_slug;
  }

  if (!buildId) return fail("Could not save the build.");

  const { error: itemsError } = await supabase.from("pc_build_items").insert(
    validItems.map((item) => ({
      build_id: buildId,
      product_id: item.product_id,
      component_type: item.component_type,
    })),
  );
  if (itemsError) return fail(itemsError.message);

  revalidatePath("/account/builds");
  revalidatePath(`/builds/${shareSlug}`);

  return ok(parsed.data.id ? "Build updated." : "Build saved to your account.", {
    id: buildId,
    shareSlug,
  });
}

export async function deleteBuildAction(buildId: string): Promise<ActionResult> {
  const user = await actionUser();
  if (!user) return fail("Sign in to manage your builds.", "auth");
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return fail("Supabase is not configured.", "not_configured");

  const { error } = await supabase
    .from("pc_builds")
    .delete()
    .eq("id", buildId)
    .eq("user_id", user.id);
  if (error) return fail(error.message);

  revalidatePath("/account/builds");
  return ok("Build deleted.");
}

export async function setBuildVisibilityAction(
  buildId: string,
  isPublic: boolean,
): Promise<ActionResult> {
  const user = await actionUser();
  if (!user) return fail("Sign in to manage your builds.", "auth");
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return fail("Supabase is not configured.", "not_configured");

  const { error } = await supabase
    .from("pc_builds")
    .update({ is_public: isPublic })
    .eq("id", buildId)
    .eq("user_id", user.id);
  if (error) return fail(error.message);

  revalidatePath("/account/builds");
  return ok(isPublic ? "Build is now shareable." : "Build is now private.");
}

export async function addBuildToCartAction(buildId: string): Promise<ActionResult> {
  const user = await actionUser();
  if (!user) return fail("Sign in to add a saved build to your cart.", "auth");
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return fail("Supabase is not configured.", "not_configured");

  const { data: build } = await supabase
    .from("pc_builds")
    .select("id, items:pc_build_items(product_id)")
    .eq("id", buildId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!build) return fail("Build not found.");

  const cartId = await ensureCart(supabase, user.id);
  if (!cartId) return fail("Could not open your cart.");

  let added = 0;
  for (const item of (build.items ?? []) as Array<{ product_id: string }>) {
    const { data: product } = await supabase
      .from("products")
      .select("id, status, inventory:product_inventory(stock)")
      .eq("id", item.product_id)
      .maybeSingle();
    const inventory = Array.isArray(product?.inventory)
      ? product?.inventory[0]
      : product?.inventory;
    if (!product || product.status !== "active" || (inventory?.stock ?? 0) <= 0) continue;

    await supabase.from("cart_items").upsert(
      { cart_id: cartId, product_id: item.product_id, quantity: 1 },
      { onConflict: "cart_id,product_id" },
    );
    added += 1;
  }

  revalidatePath("/cart");
  revalidatePath("/account", "layout");
  if (!added) return fail("No components in this build are currently in stock.");
  return { ...ok(`${added} component${added === 1 ? "" : "s"} added to your cart.`), redirectTo: "/cart" };
}
