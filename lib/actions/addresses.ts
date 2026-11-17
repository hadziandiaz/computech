"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  actionUser,
  fail,
  fieldErrors,
  firstZodMessage,
  ok,
  text,
} from "@/lib/actions/helpers";
import type { ActionResult } from "@/lib/actions/types";
import { tryCreateSupabaseServerClient } from "@/lib/supabase/server";

const addressSchema = z.object({
  label: z.string().trim().min(1, "Add a label.").max(40),
  recipient_name: z.string().trim().min(2, "Enter the recipient name.").max(100),
  phone: z
    .string()
    .trim()
    .min(8, "Enter a valid phone number.")
    .max(30)
    .regex(/^[0-9+\-\s()]+$/, "Phone number contains invalid characters."),
  province: z.string().trim().min(1, "Enter the province."),
  city: z.string().trim().min(1, "Enter the city."),
  district: z.string().trim().min(1, "Enter the district."),
  postal_code: z.string().trim().regex(/^[0-9]{4,6}$/, "Enter a valid postal code."),
  street: z.string().trim().min(5, "Enter the street address."),
  notes: z.string().trim().max(300).optional().or(z.literal("")),
  is_default: z.boolean(),
});

export async function saveAddressAction(
  formData: FormData,
): Promise<ActionResult<{ id: string }>> {
  const user = await actionUser();
  if (!user) return fail("Sign in to manage addresses.", "auth");

  const parsed = addressSchema.safeParse({
    label: text(formData, "label") || "Home",
    recipient_name: text(formData, "recipient_name"),
    phone: text(formData, "phone"),
    province: text(formData, "province"),
    city: text(formData, "city"),
    district: text(formData, "district"),
    postal_code: text(formData, "postal_code"),
    street: text(formData, "street"),
    notes: text(formData, "notes"),
    is_default: formData.get("is_default") === "on",
  });
  if (!parsed.success) {
    return fail(firstZodMessage(parsed.error), "error", fieldErrors(parsed.error));
  }

  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return fail("Supabase is not configured.", "not_configured");

  const id = text(formData, "id");
  const payload = {
    ...parsed.data,
    notes: parsed.data.notes || null,
    user_id: user.id,
  };

  if (parsed.data.is_default) {
    await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", user.id)
      .neq("id", id || "00000000-0000-0000-0000-000000000000");
  }

  if (id) {
    const { error } = await supabase
      .from("addresses")
      .update(payload)
      .eq("id", id)
      .eq("user_id", user.id);
    if (error) return fail(error.message);
    revalidatePath("/account/addresses");
    revalidatePath("/checkout");
    return ok("Address updated.", { id });
  }

  const { data: count } = await supabase
    .from("addresses")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  const { data, error } = await supabase
    .from("addresses")
    .insert({ ...payload, is_default: parsed.data.is_default || (count ?? 0) === 0 })
    .select("id")
    .maybeSingle();
  if (error || !data?.id) return fail(error?.message ?? "Could not save the address.");

  revalidatePath("/account/addresses");
  revalidatePath("/checkout");
  return ok("Address saved.", { id: data.id });
}

export async function deleteAddressAction(addressId: string): Promise<ActionResult> {
  const user = await actionUser();
  if (!user) return fail("Sign in to manage addresses.", "auth");
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return fail("Supabase is not configured.", "not_configured");

  const { error } = await supabase
    .from("addresses")
    .delete()
    .eq("id", addressId)
    .eq("user_id", user.id);
  if (error) return fail(error.message);

  revalidatePath("/account/addresses");
  revalidatePath("/checkout");
  return ok("Address removed.");
}

export async function setDefaultAddressAction(
  addressId: string,
): Promise<ActionResult> {
  const user = await actionUser();
  if (!user) return fail("Sign in to manage addresses.", "auth");
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return fail("Supabase is not configured.", "not_configured");

  await supabase
    .from("addresses")
    .update({ is_default: false })
    .eq("user_id", user.id);
  const { error } = await supabase
    .from("addresses")
    .update({ is_default: true })
    .eq("id", addressId)
    .eq("user_id", user.id);
  if (error) return fail(error.message);

  revalidatePath("/account/addresses");
  revalidatePath("/checkout");
  return ok("Default address updated.");
}
