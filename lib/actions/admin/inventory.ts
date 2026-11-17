"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  actionStaff,
  fail,
  fieldErrors,
  firstZodMessage,
  numberValue,
  ok,
  text,
} from "@/lib/actions/helpers";
import type { ActionResult } from "@/lib/actions/types";
import { tryCreateSupabaseServerClient } from "@/lib/supabase/server";

const adjustmentSchema = z.object({
  product_id: z.string().uuid("Choose a product."),
  movement_type: z.enum(["in", "out", "adjustment"]),
  quantity: z.coerce.number().int().min(1, "Quantity must be greater than zero."),
  note: z.string().trim().max(300).optional().or(z.literal("")),
});

export async function adjustStockAction(
  formData: FormData,
): Promise<ActionResult<{ stock: number }>> {
  const staff = await actionStaff();
  if (!staff) return fail("Staff access is required.", "forbidden");

  const parsed = adjustmentSchema.safeParse({
    product_id: text(formData, "product_id"),
    movement_type: text(formData, "movement_type") || "in",
    quantity: numberValue(formData, "quantity"),
    note: text(formData, "note"),
  });
  if (!parsed.success) {
    return fail(firstZodMessage(parsed.error), "error", fieldErrors(parsed.error));
  }

  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return fail("Supabase is not configured.", "not_configured");

  const { data, error } = await supabase.rpc("adjust_inventory", {
    p_product_id: parsed.data.product_id,
    p_quantity: parsed.data.quantity,
    p_movement_type: parsed.data.movement_type,
    p_note: parsed.data.note || null,
  });
  if (error) return fail(error.message);

  revalidatePath("/admin/inventory");
  revalidatePath("/admin/products");
  revalidatePath("/products");
  return ok("Stock updated.", { stock: Number(data ?? 0) });
}

export async function updateStockThresholdAction(
  formData: FormData,
): Promise<ActionResult> {
  const staff = await actionStaff();
  if (!staff) return fail("Staff access is required.", "forbidden");

  const parsed = z
    .object({
      product_id: z.string().uuid("Choose a product."),
      low_stock_threshold: z.coerce
        .number()
        .int()
        .min(0, "Enter a valid threshold."),
    })
    .safeParse({
      product_id: text(formData, "product_id"),
      low_stock_threshold: numberValue(formData, "low_stock_threshold"),
    });
  if (!parsed.success) {
    return fail(firstZodMessage(parsed.error), "error", fieldErrors(parsed.error));
  }

  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return fail("Supabase is not configured.", "not_configured");

  const { error } = await supabase
    .from("product_inventory")
    .update({ low_stock_threshold: parsed.data.low_stock_threshold })
    .eq("product_id", parsed.data.product_id);
  if (error) return fail(error.message);

  revalidatePath("/admin/inventory");
  return ok("Low-stock threshold updated.");
}
