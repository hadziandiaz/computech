import "server-only";

import { getAuthUser } from "@/lib/auth";
import { isAdmin, isStaff } from "@/lib/permissions";
import type { AuthUser } from "@/types/domain";

import type { ActionResult } from "@/lib/actions/types";

export function ok<T = unknown>(message = "", data?: T): ActionResult<T> {
  return { ok: true, code: "ok", message, data };
}

export function fail(
  message: string,
  code: ActionResult["code"] = "error",
  fieldErrors?: Record<string, string[]>,
): ActionResult<never> {
  return { ok: false, code, message, fieldErrors };
}

export async function actionUser(): Promise<AuthUser | null> {
  return getAuthUser();
}

export async function actionStaff(): Promise<AuthUser | null> {
  const user = await getAuthUser();
  if (!user || !isStaff(user.role) || user.profile?.is_suspended) return null;
  return user;
}

export async function actionAdmin(): Promise<AuthUser | null> {
  const user = await getAuthUser();
  if (!user || !isAdmin(user.role) || user.profile?.is_suspended) return null;
  return user;
}

export function text(formData: FormData, key: string, fallback = "") {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : fallback;
}

export function optionalText(formData: FormData, key: string) {
  const value = text(formData, key);
  return value === "" ? null : value;
}

export function numberValue(formData: FormData, key: string, fallback = 0) {
  const value = Number(text(formData, key));
  return Number.isFinite(value) ? value : fallback;
}

export function optionalNumber(formData: FormData, key: string) {
  const raw = text(formData, key);
  if (raw === "") return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

export function checkbox(formData: FormData, key: string) {
  const value = formData.get(key);
  return value === "on" || value === "true" || value === "1";
}

export function formValues<T extends Record<string, unknown>>(
  formData: FormData,
  keys: (keyof T)[],
): Partial<T> {
  const result: Record<string, unknown> = {};
  for (const key of keys) {
    const value = formData.get(String(key));
    if (typeof value === "string") result[String(key)] = value;
  }
  return result as Partial<T>;
}

export function fieldErrors(error: {
  flatten: () => { fieldErrors: Record<string, string[] | undefined> };
}) {
  const flat = error.flatten().fieldErrors;
  const cleaned: Record<string, string[]> = {};
  for (const [key, value] of Object.entries(flat)) {
    if (value?.length) cleaned[key] = value;
  }
  return cleaned;
}

export function firstZodMessage(error: {
  issues: Array<{ message: string }>;
}) {
  return error.issues[0]?.message ?? "Please check the submitted values.";
}
