"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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
import { sanitizeNextPath } from "@/lib/auth";
import { mergeGuestCartIntoDb } from "@/lib/cart/service";
import { siteUrl, supabaseAnonKey, supabaseUrl } from "@/lib/env";
import { createSupabaseServerClient, tryCreateSupabaseServerClient } from "@/lib/supabase/server";

const credentialsSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

const registerSchema = credentialsSchema.extend({
  full_name: z
    .string()
    .trim()
    .min(2, "Enter your full name.")
    .max(100, "Name is too long."),
  confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords do not match.",
  path: ["confirm_password"],
});

export async function signInAction(formData: FormData): Promise<ActionResult> {
  const parsed = credentialsSchema.safeParse({
    email: text(formData, "email").toLowerCase(),
    password: text(formData, "password"),
  });
  if (!parsed.success) {
    return fail(firstZodMessage(parsed.error), "error", fieldErrors(parsed.error));
  }

  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return fail("Supabase is not configured.", "not_configured");

  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error || !data.user) {
    return fail(error?.message ?? "Unable to sign in. Check your credentials.");
  }

  if (data.user.id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_suspended")
      .eq("id", data.user.id)
      .maybeSingle();
    if (profile?.is_suspended) {
      await supabase.auth.signOut();
      return fail("This account is suspended. Contact support for assistance.", "forbidden");
    }
    await mergeGuestCartIntoDb(data.user.id);
  }

  const next = sanitizeNextPath(text(formData, "next"), "/account");
  revalidatePath("/", "layout");
  redirect(next);
}

export async function signUpAction(formData: FormData): Promise<ActionResult> {
  const parsed = registerSchema.safeParse({
    email: text(formData, "email").toLowerCase(),
    password: text(formData, "password"),
    confirm_password: text(formData, "confirm_password"),
    full_name: text(formData, "full_name"),
  });
  if (!parsed.success) {
    return fail(firstZodMessage(parsed.error), "error", fieldErrors(parsed.error));
  }

  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return fail("Supabase is not configured.", "not_configured");

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.full_name },
      emailRedirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent("/account")}`,
    },
  });

  if (error) return fail(error.message);

  if (data.session?.user) {
    await mergeGuestCartIntoDb(data.session.user.id);
    revalidatePath("/", "layout");
    redirect("/account");
  }

  return ok(
    "Account created. Check your inbox for the confirmation link, then sign in.",
  );
}

export async function signOutAction(): Promise<void> {
  const supabase = await tryCreateSupabaseServerClient();
  if (supabase) await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function requestPasswordResetAction(
  formData: FormData,
): Promise<ActionResult> {
  const parsed = z
    .string()
    .email("Enter a valid email address.")
    .safeParse(text(formData, "email").toLowerCase());
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid email.");

  if (!supabaseUrl || !supabaseAnonKey) {
    return fail("Supabase is not configured.", "not_configured");
  }

  // Use implicit flow here so the recovery link works even when the email is
  // opened on a different device/browser than the one that requested it.
  // PKCE would bind the code verifier to the requesting browser and fail on
  // cross-device clicks.
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      flowType: "implicit",
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
    redirectTo: `${siteUrl}/auth/reset-callback`,
  });
  if (error) return fail(error.message);

  return ok("If an account exists for that email, a reset link has been sent.");
}

export async function updatePasswordAction(
  formData: FormData,
): Promise<ActionResult> {
  const user = await actionUser();
  if (!user) return fail("Please sign in again before changing your password.", "auth");

  const parsed = z
    .object({
      password: z.string().min(8, "Password must be at least 8 characters."),
      confirm_password: z.string(),
    })
    .refine((data) => data.password === data.confirm_password, {
      message: "Passwords do not match.",
      path: ["confirm_password"],
    })
    .safeParse({
      password: text(formData, "password"),
      confirm_password: text(formData, "confirm_password"),
    });
  if (!parsed.success) {
    return fail(firstZodMessage(parsed.error), "error", fieldErrors(parsed.error));
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return fail(error.message);

  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  // Redirect on the server: the layout revalidation above re-renders the
  // current route, which would unmount this form before a client-side
  // redirect could run (and the page would bounce to /forgot-password).
  redirect("/login?reset=1");
}

export async function updateProfileAction(
  formData: FormData,
): Promise<ActionResult> {
  const user = await actionUser();
  if (!user) return fail("Please sign in to update your profile.", "auth");

  const parsed = z
    .object({
      full_name: z
        .string()
        .trim()
        .min(1, "Enter your full name.")
        .max(100, "Name is too long."),
      phone: z
        .string()
        .trim()
        .max(30, "Phone number is too long.")
        .optional()
        .or(z.literal("")),
    })
    .safeParse({
      full_name: text(formData, "full_name"),
      phone: text(formData, "phone"),
    });
  if (!parsed.success) {
    return fail(firstZodMessage(parsed.error), "error", fieldErrors(parsed.error));
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.full_name,
      phone: parsed.data.phone || null,
    })
    .eq("id", user.id);
  if (error) return fail(error.message);

  revalidatePath("/account", "layout");
  revalidatePath("/account/profile");
  return ok("Profile updated.");
}

export async function updatePreferencesAction(
  formData: FormData,
): Promise<ActionResult> {
  const user = await actionUser();
  if (!user) return fail("Please sign in to update preferences.", "auth");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      marketing_opt_in: formData.get("marketing_opt_in") === "on",
      order_updates: formData.get("order_updates") === "on",
    })
    .eq("id", user.id);
  if (error) return fail(error.message);

  revalidatePath("/account/settings");
  return ok("Preferences saved.");
}

export async function changePasswordAction(
  formData: FormData,
): Promise<ActionResult> {
  const user = await actionUser();
  if (!user) return fail("Please sign in again.", "auth");

  const parsed = z
    .object({
      current_password: z.string().min(1, "Enter your current password."),
      password: z.string().min(8, "New password must be at least 8 characters."),
      confirm_password: z.string(),
    })
    .refine((data) => data.password === data.confirm_password, {
      message: "New passwords do not match.",
      path: ["confirm_password"],
    })
    .safeParse({
      current_password: text(formData, "current_password"),
      password: text(formData, "password"),
      confirm_password: text(formData, "confirm_password"),
    });
  if (!parsed.success) {
    return fail(firstZodMessage(parsed.error), "error", fieldErrors(parsed.error));
  }

  const supabase = await createSupabaseServerClient();
  const verify = await supabase.auth.signInWithPassword({
    email: user.email,
    password: parsed.data.current_password,
  });
  if (verify.error) return fail("Your current password is not correct.");

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return fail(error.message);

  revalidatePath("/account/settings");
  return ok("Password changed.");
}
