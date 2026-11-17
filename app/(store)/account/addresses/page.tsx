import { Check, MapPin, Pencil, Plus, Star, Trash2 } from "lucide-react";

import { ActionForm, SubmitButton, InlineButton } from "@/components/ui/action-form";
import { Badge } from "@/components/ui/badge";
import { Checkbox, Field, Input, Textarea } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { getAuthUser } from "@/lib/auth";
import {
  deleteAddressAction,
  saveAddressAction,
  setDefaultAddressAction,
} from "@/lib/actions/addresses";
import { getAddresses } from "@/lib/data/addresses";
import { formatDate } from "@/lib/format";

export const metadata = {
  title: "Addresses",
};

function AddressFields({
  address,
}: {
  address?: {
    label: string;
    recipient_name: string;
    phone: string;
    province: string;
    city: string;
    district: string;
    postal_code: string;
    street: string;
    notes: string | null;
    is_default: boolean;
  };
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Field label="Label" htmlFor="label" hint="Home, Office, Warehouse">
        <Input
          id="label"
          name="label"
          defaultValue={address?.label ?? "Home"}
          placeholder="Home"
          required
        />
      </Field>
      <Field label="Recipient" htmlFor="recipient_name">
        <Input
          id="recipient_name"
          name="recipient_name"
          defaultValue={address?.recipient_name}
          required
        />
      </Field>
      <Field label="Phone" htmlFor="phone">
        <Input id="phone" name="phone" type="tel" defaultValue={address?.phone} required />
      </Field>
      <Field label="Postal code" htmlFor="postal_code">
        <Input
          id="postal_code"
          name="postal_code"
          inputMode="numeric"
          defaultValue={address?.postal_code}
          required
        />
      </Field>
      <Field label="Province" htmlFor="province">
        <Input id="province" name="province" defaultValue={address?.province} required />
      </Field>
      <Field label="City" htmlFor="city">
        <Input id="city" name="city" defaultValue={address?.city} required />
      </Field>
      <Field label="District" htmlFor="district">
        <Input id="district" name="district" defaultValue={address?.district} required />
      </Field>
      <Field label="Street address" htmlFor="street" className="sm:col-span-2">
        <Textarea
          id="street"
          name="street"
          rows={2}
          defaultValue={address?.street}
          placeholder="Street, building, unit"
          required
        />
      </Field>
      <Field label="Delivery notes" htmlFor="notes" className="sm:col-span-2">
        <Input
          id="notes"
          name="notes"
          defaultValue={address?.notes ?? ""}
          placeholder="Gate code, landmark, preferred delivery time"
        />
      </Field>
      <label className="flex items-center gap-2 text-[12px] sm:col-span-2">
        <Checkbox name="is_default" defaultChecked={address?.is_default} />
        Use as my default shipping address
      </label>
    </div>
  );
}

export default async function AccountAddressesPage() {
  const user = await getAuthUser();
  if (!user) return null;

  const addresses = await getAddresses(user.id);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-violet">Delivery</p>
          <h1 className="mt-1 flex items-center gap-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
            <MapPin className="size-6 text-violet" /> Addresses
          </h1>
          <p className="mt-1 text-sm text-muted">
            Saved addresses can be selected at checkout to speed up future orders.
          </p>
        </div>
      </header>

      {addresses.length ? (
        <div className="grid gap-3 md:grid-cols-2">
          {addresses.map((address) => (
            <article key={address.id} className="rounded-2xl border border-line bg-white">
              <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-base font-semibold">{address.label}</h2>
                    {address.is_default ? (
                      <Badge tone="violet">
                        <Star className="size-3" /> Default
                      </Badge>
                    ) : null}
                  </div>
                  <p className="mt-0.5 text-[11px] text-muted">
                    Added {formatDate(address.created_at)}
                  </p>
                </div>
              </div>
              <div className="px-5 py-4 text-[12px] leading-relaxed">
                <p className="font-semibold">{address.recipient_name}</p>
                <p className="text-muted">{address.phone}</p>
                <p className="mt-2">{address.street}</p>
                <p className="text-muted">
                  {address.district}, {address.city}, {address.province} {address.postal_code}
                </p>
                {address.notes ? (
                  <p className="mt-1 text-[11px] italic text-muted">{address.notes}</p>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-2 border-t border-line bg-mist/40 px-4 py-3">
                {!address.is_default ? (
                  <InlineButton
                    action={setDefaultAddressAction.bind(null, address.id)}
                    variant="outline"
                    size="sm"
                    pendingText="Updating…"
                  >
                    <Check /> Set default
                  </InlineButton>
                ) : null}
                <InlineButton
                  action={deleteAddressAction.bind(null, address.id)}
                  variant="danger-ghost"
                  size="sm"
                  confirm="Remove this address? Existing orders keep their shipping snapshot."
                  pendingText="Removing…"
                >
                  <Trash2 /> Remove
                </InlineButton>
              </div>

              <details className="border-t border-line">
                <summary className="flex cursor-pointer items-center gap-1.5 px-4 py-3 text-[12px] font-semibold text-violet">
                  <Pencil className="size-3.5" /> Edit address
                </summary>
                <div className="px-4 pb-4">
                  <ActionForm action={saveAddressAction} className="space-y-3">
                    <input type="hidden" name="id" value={address.id} />
                    <AddressFields address={address} />
                    <SubmitButton size="sm" pendingText="Saving…">
                      Save changes
                    </SubmitButton>
                  </ActionForm>
                </div>
              </details>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<MapPin className="size-5" />}
          title="No saved addresses"
          description="Add a shipping address now, or enter one during checkout. The first address becomes your default."
        />
      )}

      <details
        open={!addresses.length}
        className="rounded-2xl border border-line bg-white"
        id="new-address"
      >
        <summary className="flex cursor-pointer items-center justify-between gap-3 px-5 py-4">
          <div>
            <h2 className="flex items-center gap-2 font-display text-base font-semibold">
              <Plus className="size-4 text-violet" /> Add a new address
            </h2>
            <p className="text-xs text-muted">Recipient, contact and delivery location.</p>
          </div>
        </summary>
        <div className="border-t border-line px-5 py-4">
          <ActionForm action={saveAddressAction} resetOnSuccess className="space-y-4">
            <AddressFields />
            <SubmitButton size="sm" pendingText="Saving…">
              Add address
            </SubmitButton>
          </ActionForm>
        </div>
      </details>
    </div>
  );
}
