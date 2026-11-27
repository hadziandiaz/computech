import { notFound } from "next/navigation";

import { OrderInvoice } from "@/components/store/order-invoice";
import { getAdminOrder } from "@/lib/data/orders";
import { getSiteSettings } from "@/lib/data/settings";

export const metadata = {
  title: "Invoice pesanan",
};

export default async function AdminInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [order, settings] = await Promise.all([
    getAdminOrder(id),
    getSiteSettings(),
  ]);
  if (!order) notFound();

  return (
    <OrderInvoice
      order={order}
      settings={settings}
      backHref={`/admin/orders/${order.id}`}
    />
  );
}
