import "server-only";

import { tryCreateSupabaseServerClient } from "@/lib/supabase/server";
import type {
  AdminStats,
  Order,
  Profile,
  SalesPoint,
  SupportMessage,
  UserRole,
} from "@/types/domain";

const REVENUE_STATUSES = new Set(["confirmed", "processing", "shipped", "delivered", "completed"]);
const PENDING_STATUSES = new Set(["pending", "confirmed"]);

export async function getAdminStats(): Promise<AdminStats> {
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) {
    return {
      revenue: 0,
      orders: 0,
      products: 0,
      customers: 0,
      low_stock: 0,
      pending_orders: 0,
      paid_orders: 0,
      avg_order_value: 0,
    };
  }

  const [ordersResult, productsResult, profilesResult, inventoryResult] =
    await Promise.all([
      supabase.from("orders").select("status, total, payment:payments(status)"),
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase
        .from("product_inventory")
        .select("stock, low_stock_threshold, product:products(status)"),
    ]);

  const orders = (ordersResult.data ?? []) as any[];
  let revenue = 0;
  let paidOrders = 0;
  let pendingOrders = 0;
  for (const order of orders) {
    const payment = Array.isArray(order.payment) ? order.payment[0] : order.payment;
    const paid = payment?.status === "paid" || REVENUE_STATUSES.has(order.status);
    if (paid) {
      revenue += Number(order.total ?? 0);
      paidOrders += 1;
    }
    if (PENDING_STATUSES.has(order.status)) pendingOrders += 1;
  }

  const lowStock = ((inventoryResult.data ?? []) as any[]).filter((row) => {
    const product = Array.isArray(row.product) ? row.product[0] : row.product;
    return product?.status === "active" && row.stock <= row.low_stock_threshold;
  }).length;

  return {
    revenue,
    orders: orders.length,
    products: productsResult.count ?? 0,
    customers: profilesResult.count ?? 0,
    low_stock: lowStock,
    pending_orders: pendingOrders,
    paid_orders: paidOrders,
    avg_order_value: paidOrders > 0 ? Math.round(revenue / paidOrders) : 0,
  };
}

export async function getSalesSeries(days = 30): Promise<SalesPoint[]> {
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return [];
  const since = new Date(Date.now() - (days - 1) * 86_400_000);
  since.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("orders")
    .select("created_at, total, status")
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: true });
  if (error || !data) return [];

  const points = new Map<string, SalesPoint>();
  for (let index = 0; index < days; index += 1) {
    const date = new Date(since.getTime() + index * 86_400_000);
    const key = date.toISOString().slice(0, 10);
    points.set(key, { date: key, revenue: 0, orders: 0 });
  }

  for (const order of data as any[]) {
    const key = new Date(order.created_at).toISOString().slice(0, 10);
    const point = points.get(key);
    if (!point) continue;
    point.orders += 1;
    if (REVENUE_STATUSES.has(order.status)) point.revenue += Number(order.total ?? 0);
  }

  return Array.from(points.values());
}

export interface TopProduct {
  product_name: string;
  quantity: number;
  revenue: number;
}

export async function getTopProducts(limit = 8): Promise<TopProduct[]> {
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("order_items")
    .select("product_name, quantity, line_total")
    .limit(1000);
  if (error || !data) return [];

  const map = new Map<string, TopProduct>();
  for (const row of data as any[]) {
    const current = map.get(row.product_name) ?? {
      product_name: row.product_name,
      quantity: 0,
      revenue: 0,
    };
    current.quantity += row.quantity;
    current.revenue += row.line_total;
    map.set(row.product_name, current);
  }
  return Array.from(map.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}

export interface AdminCustomer extends Profile {
  role: UserRole;
  order_count: number;
  lifetime_value: number;
}

export async function getAdminCustomers(): Promise<AdminCustomer[]> {
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return [];
  const [{ data: profiles }, { data: roles }, { data: orders }] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("user_roles").select("user_id, role"),
    supabase.from("orders").select("user_id, total, status"),
  ]);
  if (!profiles) return [];

  const roleMap = new Map(
    (roles ?? []).map((row: { user_id: string; role: UserRole }) => [row.user_id, row.role]),
  );
  const orderMap = new Map<string, { count: number; value: number }>();
  for (const order of (orders ?? []) as any[]) {
    const current = orderMap.get(order.user_id) ?? { count: 0, value: 0 };
    current.count += 1;
    if (REVENUE_STATUSES.has(order.status)) current.value += Number(order.total ?? 0);
    orderMap.set(order.user_id, current);
  }

  return (profiles as Profile[]).map((profile) => ({
    ...profile,
    role: roleMap.get(profile.id) ?? "customer",
    order_count: orderMap.get(profile.id)?.count ?? 0,
    lifetime_value: orderMap.get(profile.id)?.value ?? 0,
  }));
}

export interface AdminCustomerDetail {
  profile: Profile | null;
  role: UserRole;
  orders: Order[];
}

export async function getAdminCustomer(
  userId: string,
): Promise<AdminCustomerDetail> {
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return { profile: null, role: "customer", orders: [] };
  const [{ data: profile }, { data: role }, { data: orders }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", userId).maybeSingle(),
    supabase
      .from("orders")
      .select("*, items:order_items(*), payment:payments(*), shipment:shipments(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
  ]);
  return {
    profile: (profile as Profile | null) ?? null,
    role: ((role?.role as UserRole | undefined) ?? "customer"),
    orders: (orders ?? []) as any[],
  };
}

export interface AdminInventoryRow {
  product_id: string;
  name: string;
  sku: string;
  status: string;
  stock: number;
  reserved: number;
  low_stock_threshold: number;
  updated_at: string;
  brand_name: string | null;
}

export async function getAdminInventory(
  onlyLow = false,
): Promise<AdminInventoryRow[]> {
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("product_inventory")
    .select(
      "product_id, stock, reserved, low_stock_threshold, updated_at, product:products(name, sku, status, brand:brands(name))",
    )
    .order("stock", { ascending: true });
  if (error || !data) return [];

  return (data as any[])
    .map((row) => {
      const product = Array.isArray(row.product) ? row.product[0] : row.product;
      const brand = product?.brand
        ? Array.isArray(product.brand)
          ? product.brand[0]
          : product.brand
        : null;
      return {
        product_id: row.product_id,
        name: product?.name ?? "Unknown product",
        sku: product?.sku ?? "",
        status: product?.status ?? "unknown",
        stock: row.stock,
        reserved: row.reserved,
        low_stock_threshold: row.low_stock_threshold,
        updated_at: row.updated_at,
        brand_name: brand?.name ?? null,
      };
    })
    .filter((row) => (onlyLow ? row.stock <= row.low_stock_threshold : true));
}

export interface InventoryMovement {
  id: string;
  product_id: string;
  movement_type: string;
  quantity: number;
  stock_after: number;
  note: string | null;
  created_at: string;
  product_name?: string;
}

export async function getInventoryMovements(
  limit = 50,
): Promise<InventoryMovement[]> {
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("inventory_movements")
    .select("*, product:products(name)")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return (data as any[]).map((row) => {
    const product = Array.isArray(row.product) ? row.product[0] : row.product;
    return { ...row, product_name: product?.name ?? "Unknown product" };
  });
}

export async function getSupportMessages(): Promise<SupportMessage[]> {
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("support_messages")
    .select("*")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data as SupportMessage[];
}

export interface OrderStatusCount {
  status: string;
  count: number;
  total: number;
}

export async function getOrderStatusCounts(): Promise<OrderStatusCount[]> {
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase.from("orders").select("status, total");
  if (error || !data) return [];
  const map = new Map<string, OrderStatusCount>();
  for (const row of data as any[]) {
    const current = map.get(row.status) ?? { status: row.status, count: 0, total: 0 };
    current.count += 1;
    current.total += Number(row.total ?? 0);
    map.set(row.status, current);
  }
  return Array.from(map.values()).sort((a, b) => b.count - a.count);
}

export interface CategoryRevenue {
  category: string;
  quantity: number;
  revenue: number;
}

export async function getCategoryRevenue(limit = 8): Promise<CategoryRevenue[]> {
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("order_items")
    .select("quantity, line_total, product:products(category:categories(name))")
    .limit(2000);
  if (error || !data) return [];

  const map = new Map<string, CategoryRevenue>();
  for (const row of data as any[]) {
    const product = Array.isArray(row.product) ? row.product[0] : row.product;
    const category = product?.category
      ? Array.isArray(product.category)
        ? product.category[0]?.name
        : product.category.name
      : null;
    const key = category ?? "Uncategorised";
    const current = map.get(key) ?? { category: key, quantity: 0, revenue: 0 };
    current.quantity += row.quantity;
    current.revenue += Number(row.line_total ?? 0);
    map.set(key, current);
  }
  return Array.from(map.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}

export async function getNewsletterSubscribers() {
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("newsletter_subscribers")
    .select("*")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data as Array<{ id: string; email: string; is_active: boolean; created_at: string }>;
}
