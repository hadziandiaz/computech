import {
  CreditCard,
  ExternalLink,
  Globe2,
  Plus,
  Save,
  Store,
  Trash2,
  Truck,
} from "lucide-react";

import { AdminHeader } from "@/components/admin/admin-header";
import { ActionForm, InlineButton, SubmitButton } from "@/components/ui/action-form";
import { Badge } from "@/components/ui/badge";
import { Checkbox, Field, Input, Textarea } from "@/components/ui/input";
import {
  deleteShippingMethodAction,
  deleteShippingZoneAction,
  saveShippingMethodAction,
  saveShippingZoneAction,
} from "@/lib/actions/admin/merchandising";
import { saveSiteSettingsAction } from "@/lib/actions/admin/settings";
import { getAuthUser } from "@/lib/auth";
import {
  getShippingMethods,
  getShippingZoneRates,
  getShippingZones,
} from "@/lib/data/shipping";
import { getSiteSettings } from "@/lib/data/settings";
import { paymentConfig, shippingConfig, isServiceRoleConfigured } from "@/lib/env";
import { formatIDR } from "@/lib/format";
import type {
  ShippingMethod,
  ShippingZone,
  ShippingZoneRate,
} from "@/types/domain";

export const metadata = {
  title: "Store settings",
};

function ShippingFields({ method }: { method?: ShippingMethod }) {
  const key = method?.id ?? "new";
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Field label="Method name" htmlFor={`ship-name-${key}`} required>
        <Input id={`ship-name-${key}`} name="name" defaultValue={method?.name} required />
      </Field>
      <Field label="Courier" htmlFor={`ship-courier-${key}`} required>
        <Input id={`ship-courier-${key}`} name="courier" defaultValue={method?.courier} required />
      </Field>
      <Field label="Cost (IDR)" htmlFor={`ship-cost-${key}`}>
        <Input
          id={`ship-cost-${key}`}
          name="cost"
          type="number"
          min={0}
          step={1000}
          defaultValue={method?.cost ?? 0}
        />
      </Field>
      <Field label="Estimated days" htmlFor={`ship-days-${key}`}>
        <Input
          id={`ship-days-${key}`}
          name="estimated_days"
          defaultValue={method?.estimated_days ?? "2-4 days"}
        />
      </Field>
      <Field label="Sort order" htmlFor={`ship-sort-${key}`}>
        <Input
          id={`ship-sort-${key}`}
          name="sort_order"
          type="number"
          min={0}
          defaultValue={method?.sort_order ?? 0}
        />
      </Field>
      <Field label="Description" htmlFor={`ship-description-${key}`}>
        <Input
          id={`ship-description-${key}`}
          name="description"
          defaultValue={method?.description ?? ""}
        />
      </Field>
      <label className="flex items-center gap-2 text-[12px] sm:col-span-2">
        <Checkbox name="is_active" defaultChecked={method?.is_active ?? true} />
        Available at checkout
      </label>
    </div>
  );
}

function ZoneFields({
  zone,
  methods,
  rates,
}: {
  zone?: ShippingZone;
  methods: ShippingMethod[];
  rates: ShippingZoneRate[];
}) {
  const key = zone?.id ?? "new";
  const rateFor = (methodId: string) =>
    rates.find((rate) => rate.method_id === methodId && rate.zone_id === zone?.id)?.cost;

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Nama zona" htmlFor={`zone-name-${key}`} required>
          <Input id={`zone-name-${key}`} name="name" defaultValue={zone?.name} required />
        </Field>
        <Field label="Kode zona" htmlFor={`zone-code-${key}`} required>
          <Input
            id={`zone-code-${key}`}
            name="code"
            defaultValue={zone?.code}
            placeholder="jabodetabek"
            required
          />
        </Field>
        <Field
          label="Kata kunci wilayah"
          htmlFor={`zone-matchers-${key}`}
          className="sm:col-span-2"
          hint="Pisahkan dengan koma. Dicek terhadap provinsi, kota, dan kecamatan. Kosongkan untuk zona cadangan (fallback)."
        >
          <Input
            id={`zone-matchers-${key}`}
            name="matchers"
            defaultValue={zone?.matchers.join(", ") ?? ""}
            placeholder="dki jakarta, jakarta, bogor, depok, tangerang"
          />
        </Field>
        <Field label="Urutan" htmlFor={`zone-sort-${key}`}>
          <Input
            id={`zone-sort-${key}`}
            name="sort_order"
            type="number"
            min={0}
            defaultValue={zone?.sort_order ?? 0}
          />
        </Field>
        <Field label="Deskripsi" htmlFor={`zone-description-${key}`}>
          <Input
            id={`zone-description-${key}`}
            name="description"
            defaultValue={zone?.description ?? ""}
          />
        </Field>
      </div>
      <div className="rounded-xl border border-line bg-white p-3">
        <p className="text-[11px] font-semibold">Tarif per metode pengiriman (IDR)</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {methods.map((method) => (
            <Field key={method.id} label={method.name} htmlFor={`rate-${key}-${method.id}`}>
              <Input
                id={`rate-${key}-${method.id}`}
                name={`rate_${method.id}`}
                type="number"
                min={0}
                step={1000}
                defaultValue={rateFor(method.id) ?? method.cost}
              />
            </Field>
          ))}
        </div>
      </div>
      <label className="flex items-center gap-2 text-[12px]">
        <Checkbox name="is_active" defaultChecked={zone?.is_active ?? true} />
        Zona aktif
      </label>
    </div>
  );
}

export default async function AdminSettingsPage() {
  const [settings, methods, zones, rates, user] = await Promise.all([
    getSiteSettings(),
    getShippingMethods(false),
    getShippingZones(false),
    getShippingZoneRates(),
    getAuthUser(),
  ]);

  return (
    <div>
      <AdminHeader
        eyebrow="Configuration"
        title="Store settings"
        description="Storefront contact details, announcement bar and shipping methods. Payment and shipping credentials stay in environment variables and are never rendered."
      />

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr] xl:items-start">
        <div className="space-y-6">
          <section className="rounded-2xl border border-line bg-white p-5">
            <h2 className="flex items-center gap-2 font-display text-base font-semibold">
              <Store className="size-4 text-violet" /> Storefront identity
            </h2>
            {user?.role !== "admin" ? (
              <p className="mt-2 rounded-xl border border-[#f5dfa6] bg-[#fff7e6] px-3 py-2 text-[12px] text-[#9a6500]">
                Only administrators can save these settings. You can review the current values.
              </p>
            ) : null}
            <ActionForm action={saveSiteSettingsAction} className="mt-4 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Store name" htmlFor="store_name">
                  <Input id="store_name" name="store_name" defaultValue={settings.store_name} />
                </Field>
                <Field label="Tagline" htmlFor="store_tagline">
                  <Input id="store_tagline" name="store_tagline" defaultValue={settings.store_tagline} />
                </Field>
                <Field label="Support email" htmlFor="store_email">
                  <Input id="store_email" name="store_email" type="email" defaultValue={settings.store_email} />
                </Field>
                <Field label="WhatsApp number" htmlFor="store_whatsapp" hint="Digits with country code, e.g. 6281234567890.">
                  <Input id="store_whatsapp" name="store_whatsapp" defaultValue={settings.store_whatsapp} />
                </Field>
                <Field label="Opening hours" htmlFor="store_hours" className="sm:col-span-2">
                  <Input id="store_hours" name="store_hours" defaultValue={settings.store_hours} />
                </Field>
                <Field label="Store address" htmlFor="store_address" className="sm:col-span-2">
                  <Textarea id="store_address" name="store_address" rows={2} defaultValue={settings.store_address} />
                </Field>
                <Field
                  label="Free shipping minimum (IDR)"
                  htmlFor="free_shipping_min"
                  hint="Set 0 to never offer free shipping automatically."
                >
                  <Input
                    id="free_shipping_min"
                    name="free_shipping_min"
                    type="number"
                    min={0}
                    step={1000}
                    defaultValue={settings.free_shipping_min}
                  />
                </Field>
                <Field label="Announcement text" htmlFor="announcement_text">
                  <Input
                    id="announcement_text"
                    name="announcement_text"
                    defaultValue={settings.announcement_text}
                  />
                </Field>
                <Field label="Announcement link" htmlFor="announcement_link">
                  <Input
                    id="announcement_link"
                    name="announcement_link"
                    defaultValue={settings.announcement_link}
                    placeholder="/promotions"
                  />
                </Field>
                <Field
                  label="Manual transfer instructions"
                  htmlFor="bank_transfer_instructions"
                  className="sm:col-span-2"
                >
                  <Textarea
                    id="bank_transfer_instructions"
                    name="bank_transfer_instructions"
                    rows={3}
                    defaultValue={settings.bank_transfer_instructions}
                  />
                </Field>
                <Field label="Nama bank" htmlFor="bank_name">
                  <Input id="bank_name" name="bank_name" defaultValue={settings.bank_name} />
                </Field>
                <Field label="Nomor rekening (contoh)" htmlFor="bank_account_number">
                  <Input
                    id="bank_account_number"
                    name="bank_account_number"
                    defaultValue={settings.bank_account_number}
                  />
                </Field>
                <Field label="Atas nama rekening" htmlFor="bank_account_name" className="sm:col-span-2">
                  <Input
                    id="bank_account_name"
                    name="bank_account_name"
                    defaultValue={settings.bank_account_name}
                  />
                </Field>
                <Field label="Nama merchant QRIS" htmlFor="qris_merchant_name">
                  <Input
                    id="qris_merchant_name"
                    name="qris_merchant_name"
                    defaultValue={settings.qris_merchant_name}
                  />
                </Field>
                <Field
                  label="String QRIS (contoh)"
                  htmlFor="qris_string"
                  hint="Isi dengan string QRIS statis. Contoh ini bukan kode pembayaran sungguhan."
                >
                  <Input id="qris_string" name="qris_string" defaultValue={settings.qris_string} />
                </Field>
                <Field
                  label="Instruksi COD"
                  htmlFor="cod_instructions"
                  className="sm:col-span-2"
                >
                  <Textarea
                    id="cod_instructions"
                    name="cod_instructions"
                    rows={2}
                    defaultValue={settings.cod_instructions}
                  />
                </Field>
              </div>
              <SubmitButton size="sm" pendingText="Saving…" disabled={user?.role !== "admin"}>
                <Save /> Save settings
              </SubmitButton>
            </ActionForm>
          </section>

          <section className="rounded-2xl border border-line bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
              <h2 className="flex items-center gap-2 font-display text-base font-semibold">
                <Truck className="size-4 text-violet" /> Shipping methods
              </h2>
              <Badge tone="neutral">{methods.length}</Badge>
            </div>
            <ul className="divide-y divide-line">
              {methods.map((method) => (
                <li key={method.id}>
                  <details>
                    <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 px-5 py-3 hover:bg-mist/40 [&::-webkit-details-marker]:hidden">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-[13px] font-semibold">{method.name}</p>
                          {!method.is_active ? <Badge tone="warning">hidden</Badge> : null}
                        </div>
                        <p className="text-[10px] text-muted">
                          {method.courier} · {method.estimated_days}
                        </p>
                      </div>
                      <p className="text-[12px] font-semibold">
                        {method.cost > 0 ? formatIDR(method.cost) : "Free"}
                      </p>
                    </summary>
                    <div className="border-t border-line/60 bg-mist/20 px-5 py-4">
                      <ActionForm action={saveShippingMethodAction} className="space-y-3">
                        <input type="hidden" name="id" value={method.id} />
                        <ShippingFields method={method} />
                        <div className="flex flex-wrap items-center gap-2">
                          <SubmitButton size="sm" pendingText="Saving…">
                            Save method
                          </SubmitButton>
                          <InlineButton
                            action={deleteShippingMethodAction.bind(null, method.id)}
                            variant="danger-ghost"
                            size="sm"
                            confirm={`Delete ${method.name}? Existing orders keep their shipping snapshot.`}
                            pendingText="Deleting…"
                          >
                            <Trash2 /> Delete
                          </InlineButton>
                        </div>
                      </ActionForm>
                    </div>
                  </details>
                </li>
              ))}
              {!methods.length ? (
                <li className="px-5 py-8 text-center text-[13px] text-muted">
                  No shipping methods. Add one below so checkout can quote delivery.
                </li>
              ) : null}
            </ul>
            <div className="border-t border-line p-5">
              <h3 className="flex items-center gap-2 text-[13px] font-semibold">
                <Plus className="size-4 text-violet" /> Add shipping method
              </h3>
              <ActionForm action={saveShippingMethodAction} resetOnSuccess className="mt-3 space-y-3">
                <ShippingFields />
                <SubmitButton size="sm" variant="outline" pendingText="Creating…">
                  Create method
                </SubmitButton>
              </ActionForm>
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
              <h2 className="flex items-center gap-2 font-display text-base font-semibold">
                <Globe2 className="size-4 text-violet" /> Zona ongkir
              </h2>
              <Badge tone="neutral">{zones.length}</Badge>
            </div>
            <div className="space-y-4 p-5">
              <p className="text-[11px] leading-relaxed text-muted">
                Zona dipilih berdasarkan kata kunci pada alamat. Zona tanpa kata kunci menjadi
                cadangan untuk semua wilayah lainnya. Tarif di bawah adalah angka contoh.
              </p>
              {zones.map((zone) => (
                <details key={zone.id} className="rounded-xl border border-line">
                  <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-2 px-4 py-3 hover:bg-mist/40 [&::-webkit-details-marker]:hidden">
                    <div>
                      <p className="text-[13px] font-semibold">{zone.name}</p>
                      <p className="text-[10px] text-muted">
                        {zone.code} · {zone.matchers.length ? zone.matchers.join(", ") : "fallback"}
                      </p>
                    </div>
                    {!zone.is_active ? <Badge tone="warning">nonaktif</Badge> : null}
                  </summary>
                  <div className="border-t border-line bg-mist/20 p-4">
                    <ActionForm action={saveShippingZoneAction} className="space-y-3">
                      <input type="hidden" name="id" value={zone.id} />
                      <ZoneFields zone={zone} methods={methods} rates={rates} />
                      <div className="flex flex-wrap items-center gap-2">
                        <SubmitButton size="sm" pendingText="Saving…">
                          Save zone
                        </SubmitButton>
                        <InlineButton
                          action={deleteShippingZoneAction.bind(null, zone.id)}
                          variant="danger-ghost"
                          size="sm"
                          confirm={`Delete zona ${zone.name}? Tarif zona ini juga akan dihapus.`}
                          pendingText="Deleting…"
                        >
                          <Trash2 /> Delete
                        </InlineButton>
                      </div>
                    </ActionForm>
                  </div>
                </details>
              ))}
              <details className="rounded-xl border border-dashed border-line">
                <summary className="cursor-pointer list-none px-4 py-3 text-[13px] font-semibold hover:bg-mist/40 [&::-webkit-details-marker]:hidden">
                  + Tambah zona ongkir
                </summary>
                <div className="border-t border-line p-4">
                  <ActionForm action={saveShippingZoneAction} resetOnSuccess className="space-y-3">
                    <ZoneFields methods={methods.filter((method) => method.is_active)} rates={rates} />
                    <SubmitButton size="sm" variant="outline" pendingText="Creating…">
                      Create zone
                    </SubmitButton>
                  </ActionForm>
                </div>
              </details>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-line bg-white p-5">
            <h2 className="flex items-center gap-2 font-display text-base font-semibold">
              <CreditCard className="size-4 text-violet" /> Payment provider
            </h2>
            <div className="mt-3 space-y-2 text-[12px]">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted">Configured provider</span>
                <Badge tone={paymentConfig.provider === "manual" ? "neutral" : "violet"}>
                  {paymentConfig.provider}
                </Badge>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted">Midtrans server key</span>
                <Badge tone={paymentConfig.midtrans.serverKey ? "success" : "neutral"}>
                  {paymentConfig.midtrans.serverKey ? "Set" : "Missing"}
                </Badge>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted">Xendit secret key</span>
                <Badge tone={paymentConfig.xendit.secretKey ? "success" : "neutral"}>
                  {paymentConfig.xendit.secretKey ? "Set" : "Missing"}
                </Badge>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted">Service role key</span>
                <Badge tone={isServiceRoleConfigured ? "success" : "warning"}>
                  {isServiceRoleConfigured ? "Configured" : "Not configured"}
                </Badge>
              </div>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-muted">
              When the preferred provider is not configured, checkout falls back to manual bank
              transfer. Webhook signatures are verified before any order is updated.
            </p>
          </section>

          <section className="rounded-2xl border border-line bg-white p-5">
            <h2 className="flex items-center gap-2 font-display text-base font-semibold">
              <Truck className="size-4 text-violet" /> Shipping provider
            </h2>
            <div className="mt-3 space-y-2 text-[12px]">
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted">Mode</span>
                <Badge tone={shippingConfig.provider === "manual" ? "neutral" : "cyan"}>
                  {shippingConfig.provider}
                </Badge>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted">RajaOngkir key</span>
                <Badge tone={shippingConfig.rajaongkirApiKey ? "success" : "neutral"}>
                  {shippingConfig.rajaongkirApiKey ? "Set" : "Missing"}
                </Badge>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted">Origin city ID</span>
                <span className="font-mono text-[11px]">
                  {shippingConfig.originCityId || "Not set"}
                </span>
              </div>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-muted">
              Manual mode uses the shipping methods above. Live mode quotes RajaOngkir in the
              checkout quote endpoint and falls back to manual methods on failure.
            </p>
          </section>

          <section className="rounded-2xl border border-line bg-white p-5">
            <h2 className="font-display text-base font-semibold">Administrator bootstrap</h2>
            <p className="mt-2 text-[12px] leading-relaxed text-muted">
              The first administrator is promoted in SQL. This is intentionally not exposed in the
              UI so a compromised staff session cannot escalate itself.
            </p>
            <pre className="mt-3 overflow-x-auto rounded-xl bg-ink p-3 font-mono text-[10px] leading-relaxed text-white/80">
{`select public.bootstrap_admin('you@example.com');`}
            </pre>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-violet hover:underline"
            >
              Open Supabase dashboard <ExternalLink className="size-3" />
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}
