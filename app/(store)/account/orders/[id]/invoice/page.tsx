import { notFound } from "next/navigation";

import { OrderInvoice } from "@/components/store/order-invoice";
import { getAuthUser } from "@/lib/auth";
import { getUserOrder } from "@/lib/data/orders";
import { getSiteSettings } from "@/lib/data/settings";

export const metadata = {
  title: "Invoice pesanan",
};

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getAuthUser();
  if (!user) return null;

  const { id } = await params;
  const [order, settings] = await Promise.all([
    getUserOrder(user.id, id),
    getSiteSettings(),
  ]);
  if (!order) notFound();

  return (
    <OrderInvoice
      order={order}
      settings={settings}
      backHref={`/account/orders/${order.id}`}
    />
  );
}
