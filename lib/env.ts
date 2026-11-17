import "server-only";

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith("http"),
);

export const isServiceRoleConfigured = Boolean(
  supabaseUrl && supabaseServiceRoleKey,
);

export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
).replace(/\/$/, "");

export const paymentConfig = {
  provider: (process.env.PAYMENT_PROVIDER || "manual") as
    | "manual"
    | "midtrans"
    | "xendit",
  midtrans: {
    serverKey: process.env.MIDTRANS_SERVER_KEY ?? "",
    clientKey: process.env.MIDTRANS_CLIENT_KEY ?? "",
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  },
  xendit: {
    secretKey: process.env.XENDIT_SECRET_KEY ?? "",
    callbackToken: process.env.XENDIT_CALLBACK_TOKEN ?? "",
    isProduction: process.env.XENDIT_IS_PRODUCTION === "true",
  },
};

export const shippingConfig = {
  provider: (process.env.SHIPPING_PROVIDER || "manual") as
    | "manual"
    | "rajaongkir",
  rajaongkirApiKey: process.env.RAJAONGKIR_API_KEY ?? "",
  originCityId: process.env.RAJAONGKIR_ORIGIN_CITY_ID ?? "",
};

export const storeContactEnv = {
  whatsapp: process.env.NEXT_PUBLIC_STORE_WHATSAPP ?? "",
  email: process.env.NEXT_PUBLIC_STORE_EMAIL ?? "",
};

export function assertSupabaseConfigured() {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.",
    );
  }
}
