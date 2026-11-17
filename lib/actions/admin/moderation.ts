"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { actionStaff, fail, ok } from "@/lib/actions/helpers";
import type { ActionResult } from "@/lib/actions/types";
import { tryCreateSupabaseServerClient } from "@/lib/supabase/server";

export async function setReviewApprovalAction(
  reviewId: string,
  approved: boolean,
): Promise<ActionResult> {
  const staff = await actionStaff();
  if (!staff) return fail("Staff access is required.", "forbidden");
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return fail("Supabase is not configured.", "not_configured");

  const { data: review } = await supabase
    .from("product_reviews")
    .select("product_id, product:products(slug)")
    .eq("id", reviewId)
    .maybeSingle();

  const { error } = await supabase
    .from("product_reviews")
    .update({ is_approved: approved })
    .eq("id", reviewId);
  if (error) return fail(error.message);

  revalidatePath("/admin/reviews");
  const product = Array.isArray(review?.product) ? review?.product[0] : review?.product;
  if (product?.slug) revalidatePath(`/products/${product.slug}`);
  return ok(approved ? "Review approved and published." : "Review unpublished.");
}

export async function deleteReviewAction(reviewId: string): Promise<ActionResult> {
  const staff = await actionStaff();
  if (!staff) return fail("Staff access is required.", "forbidden");
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return fail("Supabase is not configured.", "not_configured");

  const { error } = await supabase.from("product_reviews").delete().eq("id", reviewId);
  if (error) return fail(error.message);

  revalidatePath("/admin/reviews");
  return ok("Review deleted.");
}

const supportStatuses = ["new", "in_progress", "resolved", "closed"] as const;

export async function setSupportStatusAction(
  messageId: string,
  status: string,
): Promise<ActionResult> {
  const staff = await actionStaff();
  if (!staff) return fail("Staff access is required.", "forbidden");

  const parsed = z.enum(supportStatuses).safeParse(status);
  if (!parsed.success) return fail("Invalid support status.");

  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return fail("Supabase is not configured.", "not_configured");
  const { error } = await supabase
    .from("support_messages")
    .update({ status: parsed.data })
    .eq("id", messageId);
  if (error) return fail(error.message);

  revalidatePath("/admin/support");
  return ok("Support status updated.");
}
