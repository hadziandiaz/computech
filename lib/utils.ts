import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function initials(name: string | null | undefined) {
  if (!name) return "CT";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function generateShareSlug() {
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < 10; i += 1) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function parseNumber(value: string | null | undefined, fallback = 0) {
  if (!value) return fallback;
  const cleaned = value.replace(/[^\d.,-]/g, "").trim();
  if (!cleaned) return fallback;

  // Accept both Indonesian (1.250.000,50) and English (1,250,000.50)
  // notation. When both separators appear, the right-most one is decimal.
  const lastComma = cleaned.lastIndexOf(",");
  const lastDot = cleaned.lastIndexOf(".");
  const commaCount = (cleaned.match(/,/g) ?? []).length;
  const dotCount = (cleaned.match(/\./g) ?? []).length;

  let decimal: "," | "." | null = null;
  if (lastComma > -1 && lastDot > -1) {
    decimal = lastComma > lastDot ? "," : ".";
  } else if (lastComma > -1) {
    // A single comma followed by three digits is treated as a thousands
    // separator; otherwise it is a decimal separator.
    decimal = commaCount === 1 && !/,\d{3}$/.test(cleaned) ? "," : null;
  } else if (lastDot > -1) {
    decimal = dotCount === 1 && !/\.\d{3}$/.test(cleaned) ? "." : null;
  }

  let normalized = cleaned;
  if (decimal === ",") {
    normalized = cleaned.replace(/\./g, "").replace(",", ".");
  } else if (decimal === ".") {
    normalized = cleaned.replace(/,/g, "");
  } else {
    normalized = cleaned.replace(/[.,]/g, "");
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Something went wrong. Please try again.";
}

export function absoluteUrl(path = "") {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "http://localhost:3000";
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function truncate(value: string, length: number) {
  if (value.length <= length) return value;
  return `${value.slice(0, length).trimEnd()}…`;
}

export function groupBy<T, K extends string | number>(
  items: T[],
  getKey: (item: T) => K,
) {
  return items.reduce<Record<K, T[]>>(
    (acc, item) => {
      const key = getKey(item);
      acc[key] = acc[key] ?? [];
      acc[key].push(item);
      return acc;
    },
    {} as Record<K, T[]>,
  );
}
