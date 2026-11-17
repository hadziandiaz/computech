"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  fail,
  fieldErrors,
  firstZodMessage,
  ok,
  text,
} from "@/lib/actions/helpers";
import type { ActionResult } from "@/lib/actions/types";
import { tryCreateSupabaseServerClient } from "@/lib/supabase/server";

const supportSchema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(100),
  email: z.string().trim().email("Enter a valid email address."),
  phone: z
    .string()
    .trim()
    .max(30, "Phone number is too long.")
    .optional()
    .or(z.literal("")),
  subject: z.string().trim().min(3, "Add a subject.").max(160),
  message: z
    .string()
    .trim()
    .min(10, "Tell us a little more so we can help.")
    .max(5000, "Message is too long."),
});

export async function submitSupportMessageAction(
  formData: FormData,
): Promise<ActionResult> {
  const parsed = supportSchema.safeParse({
    name: text(formData, "name"),
    email: text(formData, "email").toLowerCase(),
    phone: text(formData, "phone"),
    subject: text(formData, "subject"),
    message: text(formData, "message"),
  });
  if (!parsed.success) {
    return fail(firstZodMessage(parsed.error), "error", fieldErrors(parsed.error));
  }

  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return fail("Supabase is not configured.", "not_configured");

  const { error } = await supabase.from("support_messages").insert({
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone || null,
    subject: parsed.data.subject,
    message: parsed.data.message,
    status: "new",
  });
  if (error) return fail(error.message);

  revalidatePath("/admin/support");
  return ok("Message received. Our team will reply using the email you provided.");
}

export async function subscribeNewsletterAction(
  formData: FormData,
): Promise<ActionResult> {
  const email = text(formData, "email").toLowerCase();
  const parsed = z.string().email("Enter a valid email address.").safeParse(email);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid email address.", "error", {
      email: [parsed.error.issues[0]?.message ?? "Invalid email address."],
    });
  }

  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return fail("Supabase is not configured.", "not_configured");

  const { error } = await supabase
    .from("newsletter_subscribers")
    .upsert({ email: parsed.data, is_active: true }, { onConflict: "email" });
  if (error) return fail(error.message);

  return ok("You are subscribed. Watch your inbox for launches and offers.");
}
