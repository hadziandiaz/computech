import "server-only";

import { tryCreateSupabaseServerClient } from "@/lib/supabase/server";
import type { Order, OrderStatus, Payment, Shipment } from "@/types/domain";

const ORDER_SELECT = `
  *,
  items:order_items(*),
  payment:payments(*),
  shipment:shipments(*)
`;

function first<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

export function mapOrder(row: any): Order {
  return {
    ...(row as Order),
    items: (row.items ?? row.order_items ?? []) as Order["items"],
    payment: first<Payment>(row.payment),
    shipment: first<Shipment>(row.shipment),
  };
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map(mapOrder);
}

export async function getUserOrder(
  userId: string,
  orderId: string,
): Promise<Order | null> {
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("user_id", userId)
    .eq("id", orderId)
    .maybeSingle();
  if (error || !data) return null;
  return mapOrder(data);
}

export interface AdminOrderQuery {
  q?: string;
  status?: OrderStatus | "all";
  paymentStatus?: string;
  page?: number;
  perPage?: number;
}

export interface AdminOrderPage {
  orders: Order[];
  total: number;
  page: number;
  perPage: number;
  pageCount: number;
}

export async function getAdminOrders(
  query: AdminOrderQuery = {},
): Promise<AdminOrderPage> {
  const supabase = await tryCreateSupabaseServerClient();
  const page = Math.max(1, query.page ?? 1);
  const perPage = Math.min(100, Math.max(1, query.perPage ?? 20));
  if (!supabase) {
    return { orders: [], total: 0, page, perPage, pageCount: 0 };
  }

  let builder = supabase.from("orders").select(ORDER_SELECT, { count: "exact" });
  if (query.status && query.status !== "all") builder = builder.eq("status", query.status);
  if (query.q) {
    const term = query.q.replace(/[,%()*\\]/g, " ").trim();
    if (term) {
      builder = builder.or(
        `order_number.ilike.%${term}%,customer_name.ilike.%${term}%,customer_email.ilike.%${term}%`,
      );
    }
  }
  const from = (page - 1) * perPage;
  const { data, error, count } = await builder
    .order("created_at", { ascending: false })
    .range(from, from + perPage - 1);
  if (error || !data) {
    return { orders: [], total: 0, page, perPage, pageCount: 0 };
  }
  const total = count ?? data.length;
  return {
    orders: data.map(mapOrder),
    total,
    page,
    perPage,
    pageCount: Math.max(1, Math.ceil(total / perPage)),
  };
}

export async function getAdminOrder(orderId: string): Promise<Order | null> {
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("id", orderId)
    .maybeSingle();
  if (error || !data) return null;
  return mapOrder(data);
}

export async function getOrderByNumber(
  orderNumber: string,
  email: string,
): Promise<Record<string, unknown> | null> {
  const supabase = await tryCreateSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase.rpc("track_order", {
    p_order_number: orderNumber,
    p_email: email,
  });
  if (error || !data) return null;
  return data as Record<string, unknown>;
}

export async function getRecentOrders(limit = 8): Promise<Order[]> {
  const page = await getAdminOrders({ perPage: limit });
  return page.orders;
}
