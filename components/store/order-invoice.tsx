import { ArrowLeft, Banknote, PackageCheck, QrCode } from "lucide-react";
import Link from "next/link";

import { QrisCode } from "@/components/store/qris-code";
import { PrintButton } from "@/components/ui/print-button";
import { formatDateTime, formatIDR } from "@/lib/format";
import type { Order, SiteSettings } from "@/types/domain";

export function OrderInvoice({
  order,
  settings,
  backHref,
}: {
  order: Order;
  settings: SiteSettings;
  backHref: string;
}) {
  const payment = order.payment;
  const detail = payment?.raw_response ?? null;
  const method = payment?.method ?? "bank_transfer";
  const address = order.shipping_address;
  const itemCount = order.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-muted hover:text-ink"
        >
          <ArrowLeft className="size-3.5" /> Kembali
        </Link>
        <PrintButton />
      </div>

      <article className="rounded-2xl border border-line bg-white p-6 sm:p-10">
        <div className="flex flex-wrap items-start justify-between gap-6 border-b border-line pb-6">
          <div>
            <p className="font-display text-2xl font-bold tracking-tight text-violet">
              {settings.store_name}
            </p>
            <p className="mt-1 text-[11px] text-muted">{settings.store_tagline}</p>
            {settings.store_address ? (
              <p className="mt-1 whitespace-pre-line text-[11px] text-muted">
                {settings.store_address}
              </p>
            ) : null}
            {settings.store_email ? (
              <p className="text-[11px] text-muted">{settings.store_email}</p>
            ) : null}
          </div>
          <div className="text-right">
            <h1 className="font-display text-xl font-bold">INVOICE</h1>
            <p className="mt-1 font-mono text-[12px] font-semibold">{order.order_number}</p>
            <p className="text-[11px] text-muted">{formatDateTime(order.created_at)}</p>
          </div>
        </div>

        <div className="grid gap-6 border-b border-line py-6 sm:grid-cols-2">
          <div>
            <p className="eyebrow text-violet">Ditagihkan kepada</p>
            <p className="mt-2 text-[13px] font-semibold">{order.customer_name}</p>
            <p className="text-[12px] text-muted">{order.customer_email}</p>
            <p className="text-[12px] text-muted">{order.customer_phone}</p>
          </div>
          <div>
            <p className="eyebrow text-violet">Alamat pengiriman</p>
            <p className="mt-2 text-[13px] font-semibold">{address?.recipient_name}</p>
            <p className="text-[12px] leading-relaxed text-muted">
              {address?.street}, {address?.district}, {address?.city}, {address?.province}{" "}
              {address?.postal_code}
            </p>
            {order.shipping_zone_name ? (
              <p className="mt-1 text-[11px] font-semibold text-ink">
                Zona ongkir: {order.shipping_zone_name}
                {order.shipping_zone_code ? ` (${order.shipping_zone_code})` : ""}
              </p>
            ) : null}
          </div>
        </div>

        <div className="py-6">
          <p className="eyebrow text-violet">Rincian pesanan</p>
          <table className="mt-3 w-full text-left text-[12px]">
            <thead>
              <tr className="border-b border-line text-[10px] uppercase tracking-wide text-muted">
                <th className="pb-2 font-semibold">Produk</th>
                <th className="pb-2 text-center font-semibold">Qty</th>
                <th className="pb-2 text-right font-semibold">Harga</th>
                <th className="pb-2 text-right font-semibold">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {(order.items ?? []).map((item) => (
                <tr key={item.id}>
                  <td className="py-2.5 pr-3">
                    <p className="font-semibold">{item.product_name}</p>
                    <p className="font-mono text-[10px] text-muted">{item.product_sku}</p>
                  </td>
                  <td className="py-2.5 text-center">{item.quantity}</td>
                  <td className="py-2.5 text-right">{formatIDR(item.unit_price)}</td>
                  <td className="py-2.5 text-right font-semibold">{formatIDR(item.line_total)}</td>
                </tr>
              ))}
              {!order.items?.length ? (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-muted">
                    Tidak ada rincian produk.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>

          <dl className="ml-auto mt-4 max-w-xs space-y-1.5 text-[12px]">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Subtotal ({itemCount} item)</dt>
              <dd className="font-semibold">{formatIDR(order.subtotal)}</dd>
            </div>
            {order.discount > 0 ? (
              <div className="flex justify-between gap-4">
                <dt className="text-muted">
                  Diskon {order.voucher_code ? `(${order.voucher_code})` : ""}
                </dt>
                <dd className="font-semibold text-[#18794e]">−{formatIDR(order.discount)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Ongkir</dt>
              <dd className="font-semibold">
                {order.shipping_cost > 0 ? formatIDR(order.shipping_cost) : "Gratis"}
              </dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-line pt-2 text-base">
              <dt className="font-semibold">Total pesanan</dt>
              <dd className="font-display font-bold">{formatIDR(order.total)}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-xl border border-violet/20 bg-violet-soft/30 p-4">
          <div className="flex flex-wrap items-center gap-2">
            {detail?.kind === "cod" ? (
              <PackageCheck className="size-4 text-violet" />
            ) : detail?.kind === "qris" ? (
              <QrCode className="size-4 text-violet" />
            ) : (
              <Banknote className="size-4 text-violet" />
            )}
            <p className="font-display text-sm font-semibold">Instruksi pembayaran</p>
            <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold uppercase text-muted">
              {method.replaceAll("_", " ")}
            </span>
          </div>
          <p className="mt-2 whitespace-pre-line text-[12px] leading-relaxed text-muted">
            {detail?.instructions ?? settings.bank_transfer_instructions}
          </p>

          {detail?.bank ? (
            <div className="mt-3 grid gap-1 text-[12px]">
              <p className="font-semibold text-ink">Rekening contoh</p>
              <p>Bank: {detail.bank.bankName}</p>
              <p>Atas nama: {detail.bank.accountName}</p>
              <p>
                Nomor rekening:{" "}
                <span className="font-mono font-semibold">{detail.bank.accountNumber}</span>
              </p>
            </div>
          ) : null}

          {detail?.qris ? (
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <QrisCode value={detail.qris.value} size={144} />
              <div className="text-[12px]">
                <p className="font-semibold text-ink">{detail.qris.merchantName}</p>
                <p className="text-muted">Contoh QRIS statis untuk demo.</p>
              </div>
            </div>
          ) : null}

          {detail?.uniqueCode ? (
            <dl className="mt-3 grid gap-1 border-t border-violet/20 pt-3 text-[12px] sm:grid-cols-3">
              <div>
                <dt className="text-muted">Kode unik</dt>
                <dd className="font-mono font-semibold">+{detail.uniqueCode}</dd>
              </div>
              <div>
                <dt className="text-muted">Nominal transfer / bayar</dt>
                <dd className="font-display font-bold text-violet-dark">
                  {formatIDR(detail.amountDue ?? order.total)}
                </dd>
              </div>
              <div>
                <dt className="text-muted">Status pembayaran</dt>
                <dd className="font-semibold capitalize">
                  {detail.kind === "cod" ? "Dibayar saat diterima" : "Menunggu konfirmasi"}
                </dd>
              </div>
            </dl>
          ) : null}
        </div>

        <p className="mt-6 border-t border-line pt-4 text-[10px] leading-relaxed text-muted">
          Invoice ini adalah bukti pesanan dan instruksi pembayaran. Nomor rekening dan QRIS yang
          ditampilkan adalah data contoh untuk keperluan demo. Simpan invoice ini sebagai PDF melalui
          tombol Cetak / Simpan PDF.
        </p>
      </article>
    </div>
  );
}
