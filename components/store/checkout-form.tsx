"use client";

import {
  AlertCircle,
  Banknote,
  CheckCircle2,
  CreditCard,
  Loader2,
  MapPin,
  QrCode,
  ShieldCheck,
  Smartphone,
  Tag,
  Truck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { ActionForm, SubmitButton } from "@/components/ui/action-form";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Price } from "@/components/ui/price";
import {
  placeOrderAction,
  validateVoucherAction,
} from "@/lib/actions/orders";
import { formatIDR } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Address, CartLine, ShippingMethod } from "@/types/domain";

const paymentMethods = [
  {
    value: "bank_transfer",
    label: "Bank transfer",
    description: "Transfer the exact total and include your order number.",
    icon: Banknote,
  },
  {
    value: "ewallet",
    label: "E-wallet",
    description: "Pay through the provider's e-wallet flow.",
    icon: Smartphone,
  },
  {
    value: "card",
    label: "Card",
    description: "Secure card payment through the configured provider.",
    icon: CreditCard,
  },
  {
    value: "qris",
    label: "QRIS",
    description: "Scan a QR code with any supported Indonesian wallet.",
    icon: QrCode,
  },
] as const;

type PaymentMethod = (typeof paymentMethods)[number]["value"];

export function CheckoutForm({
  addresses,
  shippingMethods,
  lines,
  subtotal,
  savings,
  defaultName,
  defaultPhone,
  paymentProvider,
  bankInstructions,
  freeShippingEligible,
}: {
  addresses: Address[];
  shippingMethods: ShippingMethod[];
  lines: CartLine[];
  subtotal: number;
  savings: number;
  defaultName: string;
  defaultPhone: string;
  paymentProvider: string;
  bankInstructions: string;
  freeShippingEligible: boolean;
}) {
  const defaultAddress = addresses.find((address) => address.is_default) ?? addresses[0] ?? null;
  const [useSaved, setUseSaved] = useState(Boolean(defaultAddress));
  const [addressId, setAddressId] = useState(defaultAddress?.id ?? "");
  const [shippingId, setShippingId] = useState(shippingMethods[0]?.id ?? "");
  const [payment, setPayment] = useState<PaymentMethod>("bank_transfer");
  const [voucherInput, setVoucherInput] = useState("");
  const [voucher, setVoucher] = useState<{ code: string; discount: number } | null>(null);
  const [voucherPending, startVoucher] = useTransition();

  const selectedAddress = addresses.find((address) => address.id === addressId) ?? null;
  const selectedShipping = shippingMethods.find((method) => method.id === shippingId) ?? null;
  const shippingCost = freeShippingEligible ? 0 : (selectedShipping?.cost ?? 0);
  const discount = voucher?.discount ?? 0;
  const total = Math.max(0, subtotal - discount) + shippingCost;

  function applyVoucher() {
    const code = voucherInput.trim();
    if (!code) {
      setVoucher(null);
      toast.error("Enter a voucher code first.");
      return;
    }
    startVoucher(async () => {
      const result = await validateVoucherAction(code);
      if (result.ok && result.data) {
        setVoucher({ code: result.data.code, discount: result.data.discount });
        toast.success(result.message || "Voucher applied.");
      } else {
        setVoucher(null);
        toast.error(result.message || "This voucher cannot be used.");
      }
    });
  }

  const addressFields = selectedAddress
    ? {
        recipient_name: selectedAddress.recipient_name,
        phone: selectedAddress.phone,
        province: selectedAddress.province,
        city: selectedAddress.city,
        district: selectedAddress.district,
        postal_code: selectedAddress.postal_code,
        street: selectedAddress.street,
        notes: selectedAddress.notes ?? "",
      }
    : {
        recipient_name: defaultName,
        phone: defaultPhone,
        province: "",
        city: "",
        district: "",
        postal_code: "",
        street: "",
        notes: "",
      };

  return (
    <ActionForm action={placeOrderAction} className="grid gap-6 lg:grid-cols-[1fr_380px] lg:items-start">
      {useSaved && selectedAddress ? (
        <>
          <input type="hidden" name="address_id" value={selectedAddress.id} />
          {Object.entries(addressFields).map(([key, value]) => (
            <input key={key} type="hidden" name={key} value={value ?? ""} />
          ))}
        </>
      ) : (
        <input type="hidden" name="address_id" value="" />
      )}
      <input type="hidden" name="shipping_method_id" value={shippingId} />
      <input type="hidden" name="voucher_code" value={voucher?.code ?? ""} />

      <div className="space-y-5">
        <section className="rounded-2xl border border-line bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 font-display text-base font-semibold">
              <MapPin className="size-4 text-violet" /> Delivery address
            </h2>
            {addresses.length ? (
              <button
                type="button"
                onClick={() => {
                  setUseSaved((value) => !value);
                  if (!addressId && defaultAddress) setAddressId(defaultAddress.id);
                }}
                className="text-[11px] font-semibold text-violet hover:underline"
              >
                {useSaved ? "Use a new address" : "Use a saved address"}
              </button>
            ) : null}
          </div>

          {useSaved && addresses.length ? (
            <div className="mt-3 space-y-2">
              {addresses.map((address) => {
                const active = address.id === addressId;
                return (
                  <button
                    key={address.id}
                    type="button"
                    onClick={() => setAddressId(address.id)}
                    className={cn(
                      "w-full rounded-xl border p-3.5 text-left transition-colors",
                      active
                        ? "border-violet bg-violet-soft/60"
                        : "border-line bg-white hover:border-ink/20",
                    )}
                  >
                    <span className="flex items-start gap-2">
                      <span
                        className={cn(
                          "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border",
                          active ? "border-violet bg-violet text-white" : "border-line",
                        )}
                      >
                        {active ? <CheckCircle2 className="size-2.5" /> : null}
                      </span>
                      <span className="min-w-0">
                        <span className="flex flex-wrap items-center gap-1.5 text-[12px] font-semibold">
                          {address.label}
                          {address.is_default ? <Badge tone="neutral">Default</Badge> : null}
                        </span>
                        <span className="mt-0.5 block text-[12px] text-ink">{address.recipient_name} · {address.phone}</span>
                        <span className="mt-0.5 block text-[11px] leading-relaxed text-muted">
                          {address.street}, {address.district}, {address.city}, {address.province} {address.postal_code}
                        </span>
                      </span>
                    </span>
                  </button>
                );
              })}
              <Link
                href="/account/addresses"
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-violet hover:underline"
              >
                Manage addresses
              </Link>
            </div>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="recipient_name" required>
                  Recipient name
                </Label>
                <Input
                  id="recipient_name"
                  name="recipient_name"
                  defaultValue={addressFields.recipient_name}
                  autoComplete="name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone" required>
                  Phone
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  defaultValue={addressFields.phone}
                  autoComplete="tel"
                  required
                  minLength={8}
                />
              </div>
              <div>
                <Label htmlFor="province" required>
                  Province
                </Label>
                <Input id="province" name="province" autoComplete="address-level1" required />
              </div>
              <div>
                <Label htmlFor="city" required>
                  City / regency
                </Label>
                <Input id="city" name="city" autoComplete="address-level2" required />
              </div>
              <div>
                <Label htmlFor="district" required>
                  District
                </Label>
                <Input id="district" name="district" autoComplete="address-level3" required />
              </div>
              <div>
                <Label htmlFor="postal_code" required>
                  Postal code
                </Label>
                <Input
                  id="postal_code"
                  name="postal_code"
                  inputMode="numeric"
                  pattern="[0-9]{4,6}"
                  autoComplete="postal-code"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="street" required>
                  Street address
                </Label>
                <Textarea
                  id="street"
                  name="street"
                  defaultValue={addressFields.street}
                  autoComplete="street-address"
                  required
                  minLength={5}
                  className="min-h-20"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="notes">Address note</Label>
                <Input
                  id="notes"
                  name="notes"
                  defaultValue={addressFields.notes ?? ""}
                  placeholder="Landmark, unit number, delivery instructions"
                />
              </div>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-line bg-white p-5">
          <h2 className="flex items-center gap-2 font-display text-base font-semibold">
            <Truck className="size-4 text-violet" /> Delivery method
          </h2>
          {shippingMethods.length ? (
            <div className="mt-3 space-y-2">
              {shippingMethods.map((method) => {
                const active = method.id === shippingId;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setShippingId(method.id)}
                    className={cn(
                      "flex w-full items-start justify-between gap-3 rounded-xl border p-3.5 text-left transition-colors",
                      active ? "border-violet bg-violet-soft/60" : "border-line bg-white hover:border-ink/20",
                    )}
                  >
                    <span className="flex items-start gap-2.5">
                      <span
                        className={cn(
                          "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border",
                          active ? "border-violet bg-violet text-white" : "border-line",
                        )}
                      >
                        {active ? <CheckCircle2 className="size-2.5" /> : null}
                      </span>
                      <span>
                        <span className="block text-[12px] font-semibold">{method.name}</span>
                        <span className="mt-0.5 block text-[11px] text-muted">
                          {method.courier} · {method.estimated_days}
                          {method.description ? ` · ${method.description}` : ""}
                        </span>
                      </span>
                    </span>
                    <span className="shrink-0 text-[12px] font-semibold">
                      {method.cost > 0 ? formatIDR(method.cost) : "Free"}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="mt-2 text-sm text-muted">
              No delivery methods are configured. Please contact support before ordering.
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-line bg-white p-5">
          <h2 className="flex items-center gap-2 font-display text-base font-semibold">
            <CreditCard className="size-4 text-violet" /> Payment method
          </h2>
          <p className="mt-1 text-[11px] text-muted">
            Provider: <span className="font-semibold text-ink">{paymentProvider}</span>. Instructions
            are generated after the order is created.
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {paymentMethods.map((method) => {
              const active = method.value === payment;
              return (
                <button
                  key={method.value}
                  type="button"
                  onClick={() => setPayment(method.value)}
                  className={cn(
                    "flex items-start gap-2.5 rounded-xl border p-3.5 text-left transition-colors",
                    active ? "border-violet bg-violet-soft/60" : "border-line bg-white hover:border-ink/20",
                  )}
                >
                  <method.icon className={cn("mt-0.5 size-4 shrink-0", active ? "text-violet" : "text-muted")} />
                  <span>
                    <span className="block text-[12px] font-semibold">{method.label}</span>
                    <span className="mt-0.5 block text-[10px] leading-relaxed text-muted">
                      {method.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
          <input type="hidden" name="payment_method" value={payment} />
          {payment === "bank_transfer" ? (
            <p className="mt-3 rounded-xl bg-mist px-3 py-2 text-[11px] leading-relaxed text-muted">
              {bankInstructions}
            </p>
          ) : null}
        </section>

        <section className="rounded-2xl border border-line bg-white p-5">
          <h2 className="font-display text-base font-semibold">Order notes</h2>
          <Textarea
            name="order_notes"
            className="mt-2 min-h-20"
            placeholder="Optional note for the team about this order"
            maxLength={500}
          />
        </section>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-28">
        <div className="overflow-hidden rounded-2xl border border-line bg-white">
          <div className="border-b border-line px-4 py-3">
            <h2 className="font-display text-base font-semibold">Your order</h2>
            <p className="text-[11px] text-muted">{lines.length} product line{lines.length === 1 ? "" : "s"}</p>
          </div>
          <ul className="max-h-72 divide-y divide-line overflow-y-auto">
            {lines.map((line) => {
              const image = line.product.images?.[0]?.url;
              return (
                <li key={line.product.id} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="relative size-10 shrink-0 overflow-hidden rounded-lg border border-line bg-mist">
                    {image ? (
                      <Image src={image} alt="" fill sizes="40px" className="object-cover" />
                    ) : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[11px] font-semibold">{line.product.name}</span>
                    <span className="text-[10px] text-muted">× {line.quantity}</span>
                  </span>
                  <Price value={line.line_total} size="sm" />
                </li>
              );
            })}
          </ul>

          <div className="space-y-3 border-t border-line p-4">
            <div>
              <Label htmlFor="voucher_code_input" className="flex items-center gap-1.5">
                <Tag className="size-3.5 text-violet" /> Voucher
              </Label>
              <div className="flex gap-2">
                <Input
                  id="voucher_code_input"
                  value={voucherInput}
                  onChange={(event) => setVoucherInput(event.target.value.toUpperCase())}
                  placeholder="Enter code"
                  className="h-10 flex-1 font-mono text-[12px]"
                />
                <button
                  type="button"
                  onClick={applyVoucher}
                  disabled={voucherPending}
                  className={buttonVariants({ variant: "outline", size: "sm", className: "h-10" })}
                >
                  {voucherPending ? <Loader2 className="animate-spin" /> : "Apply"}
                </button>
              </div>
              {voucher ? (
                <p className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-[#18794e]">
                  <CheckCircle2 className="size-3.5" /> {voucher.code} applied
                  <button
                    type="button"
                    className="ml-1 text-coral hover:underline"
                    onClick={() => {
                      setVoucher(null);
                      setVoucherInput("");
                    }}
                  >
                    Remove
                  </button>
                </p>
              ) : null}
            </div>

            <dl className="space-y-2 border-t border-line pt-3 text-[13px]">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Subtotal</dt>
                <dd className="font-semibold">{formatIDR(subtotal)}</dd>
              </div>
              {savings > 0 ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Campaign savings</dt>
                  <dd className="font-semibold text-coral">−{formatIDR(savings)}</dd>
                </div>
              ) : null}
              {discount > 0 ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Voucher discount</dt>
                  <dd className="font-semibold text-coral">−{formatIDR(discount)}</dd>
                </div>
              ) : null}
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Shipping</dt>
                <dd className="font-semibold">{shippingCost > 0 ? formatIDR(shippingCost) : "Free"}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 border-t border-line pt-2">
                <dt className="font-semibold">Total</dt>
                <dd className="font-display text-xl font-bold">{formatIDR(total)}</dd>
              </div>
            </dl>

            {freeShippingEligible && selectedShipping && selectedShipping.cost > 0 ? (
              <p className="flex items-start gap-1.5 text-[10px] leading-relaxed text-muted">
                <Truck className="mt-0.5 size-3 shrink-0" />
                Free shipping applied to this order.
              </p>
            ) : null}

            {discount === 0 && voucherInput ? (
              <p className="flex items-start gap-1.5 text-[10px] leading-relaxed text-muted">
                <AlertCircle className="mt-0.5 size-3 shrink-0" />
                Apply the voucher to see its discount. Only one voucher can be used per order.
              </p>
            ) : null}

            <SubmitButton
              className="w-full"
              size="lg"
              pendingText="Placing order…"
              disabled={!shippingMethods.length}
            >
              <ShieldCheck /> Place order · {formatIDR(total)}
            </SubmitButton>
            <p className="text-center text-[10px] leading-relaxed text-muted">
              The server recalculates prices, stock, voucher eligibility and shipping before creating
              the order.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-mist/70 p-4 text-[11px] leading-relaxed text-muted">
          <p className="flex items-center gap-1.5 font-semibold text-ink">
            <AlertCircle className="size-3.5 text-violet" /> Before placing the order
          </p>
          <p className="mt-1.5">
            Verify the delivery address and phone number. A saved address is stored as a snapshot on
            the order, so later edits do not change an existing order.
          </p>
        </div>
      </aside>
    </ActionForm>
  );
}
