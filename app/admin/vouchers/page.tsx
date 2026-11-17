import { Plus, TicketPercent, Trash2 } from "lucide-react";

import { AdminHeader } from "@/components/admin/admin-header";
import { ActionForm, InlineButton, SubmitButton } from "@/components/ui/action-form";
import { Badge } from "@/components/ui/badge";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/input";
import {
  deleteVoucherAction,
  saveVoucherAction,
} from "@/lib/actions/admin/merchandising";
import { getAllVouchers } from "@/lib/data/vouchers";
import { daysUntil, formatDate, formatIDR } from "@/lib/format";
import type { Voucher } from "@/types/domain";

export const metadata = {
  title: "Vouchers",
};

function toLocalInput(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function voucherState(voucher: Voucher) {
  const now = Date.now();
  if (!voucher.is_active) return { label: "Inactive", tone: "neutral" as const };
  if (new Date(voucher.starts_at).getTime() > now) return { label: "Scheduled", tone: "cyan" as const };
  if (voucher.expires_at && new Date(voucher.expires_at).getTime() < now) {
    return { label: "Expired", tone: "neutral" as const };
  }
  if (voucher.usage_limit != null && voucher.used_count >= voucher.usage_limit) {
    return { label: "Exhausted", tone: "warning" as const };
  }
  return { label: "Active", tone: "success" as const };
}

function VoucherFields({ voucher }: { voucher?: Voucher }) {
  const key = voucher?.id ?? "new";
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Field label="Code" htmlFor={`voucher-code-${key}`} required hint="Uppercase letters, numbers, - and _.">
        <Input
          id={`voucher-code-${key}`}
          name="code"
          defaultValue={voucher?.code}
          placeholder="COMPUTECH10"
          required
        />
      </Field>
      <Field label="Name" htmlFor={`voucher-name-${key}`} required>
        <Input id={`voucher-name-${key}`} name="name" defaultValue={voucher?.name} required />
      </Field>
      <Field label="Discount type" htmlFor={`voucher-type-${key}`}>
        <Select
          id={`voucher-type-${key}`}
          name="discount_type"
          defaultValue={voucher?.discount_type ?? "fixed"}
        >
          <option value="fixed">Fixed amount</option>
          <option value="percentage">Percentage</option>
        </Select>
      </Field>
      <Field label="Discount value" htmlFor={`voucher-value-${key}`} required>
        <Input
          id={`voucher-value-${key}`}
          name="discount_value"
          type="number"
          min={1}
          defaultValue={voucher?.discount_value ?? 50000}
          required
        />
      </Field>
      <Field label="Minimum purchase (IDR)" htmlFor={`voucher-min-${key}`}>
        <Input
          id={`voucher-min-${key}`}
          name="min_purchase"
          type="number"
          min={0}
          step={1000}
          defaultValue={voucher?.min_purchase ?? 0}
        />
      </Field>
      <Field label="Maximum discount (IDR)" htmlFor={`voucher-max-${key}`} hint="Blank for no cap.">
        <Input
          id={`voucher-max-${key}`}
          name="max_discount"
          type="number"
          min={0}
          step={1000}
          defaultValue={voucher?.max_discount ?? ""}
        />
      </Field>
      <Field label="Starts" htmlFor={`voucher-start-${key}`} required>
        <Input
          id={`voucher-start-${key}`}
          name="starts_at"
          type="datetime-local"
          defaultValue={toLocalInput(voucher?.starts_at) || toLocalInput(new Date().toISOString())}
          required
        />
      </Field>
      <Field label="Expires" htmlFor={`voucher-expires-${key}`} hint="Leave blank for no expiry.">
        <Input
          id={`voucher-expires-${key}`}
          name="expires_at"
          type="datetime-local"
          defaultValue={toLocalInput(voucher?.expires_at)}
        />
      </Field>
      <Field label="Total usage limit" htmlFor={`voucher-usage-${key}`} hint="Blank for unlimited.">
        <Input
          id={`voucher-usage-${key}`}
          name="usage_limit"
          type="number"
          min={1}
          defaultValue={voucher?.usage_limit ?? ""}
        />
      </Field>
      <Field label="Limit per customer" htmlFor={`voucher-per-user-${key}`}>
        <Input
          id={`voucher-per-user-${key}`}
          name="per_user_limit"
          type="number"
          min={1}
          defaultValue={voucher?.per_user_limit ?? 1}
        />
      </Field>
      <Field label="Description" htmlFor={`voucher-description-${key}`} className="sm:col-span-2">
        <Textarea
          id={`voucher-description-${key}`}
          name="description"
          rows={2}
          defaultValue={voucher?.description ?? ""}
        />
      </Field>
      <label className="flex items-center gap-2 text-[12px] sm:col-span-2">
        <Checkbox name="is_active" defaultChecked={voucher?.is_active ?? true} />
        Voucher is active
      </label>
    </div>
  );
}

export default async function AdminVouchersPage() {
  const vouchers = await getAllVouchers();
  const active = vouchers.filter((voucher) => voucherState(voucher).label === "Active");
  const redemptions = vouchers.reduce((sum, voucher) => sum + voucher.used_count, 0);
  const discountGiven = vouchers.reduce(
    (sum, voucher) => sum + voucher.used_count * voucher.discount_value,
    0,
  );

  return (
    <div>
      <AdminHeader
        eyebrow="Merchandising"
        title="Vouchers"
        description="Voucher validation, per-customer limits and discount calculation run in Postgres when an order is placed, so a tampered client cannot change the price."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-line bg-white p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted">Active</p>
          <p className="mt-1 font-display text-2xl font-bold">{active.length}</p>
          <p className="text-[11px] text-muted">Redeemable right now</p>
        </div>
        <div className="rounded-2xl border border-line bg-white p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted">
            Redemptions
          </p>
          <p className="mt-1 font-display text-2xl font-bold">{redemptions}</p>
          <p className="text-[11px] text-muted">Across all vouchers</p>
        </div>
        <div className="rounded-2xl border border-line bg-white p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted">
            Discount value issued
          </p>
          <p className="mt-1 font-display text-2xl font-bold">{formatIDR(discountGiven)}</p>
          <p className="text-[11px] text-muted">Approximate face value</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.45fr_1fr] xl:items-start">
        <section className="rounded-2xl border border-line bg-white">
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
            <h2 className="flex items-center gap-2 font-display text-base font-semibold">
              <TicketPercent className="size-4 text-violet" /> All vouchers
            </h2>
            <Badge tone="neutral">{vouchers.length}</Badge>
          </div>
          {vouchers.length ? (
            <ul className="divide-y divide-line">
              {vouchers.map((voucher) => {
                const state = voucherState(voucher);
                return (
                  <li key={voucher.id}>
                    <details>
                      <summary className="flex cursor-pointer list-none flex-wrap items-start justify-between gap-3 px-5 py-3.5 hover:bg-mist/40 [&::-webkit-details-marker]:hidden">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-mono text-[13px] font-bold text-violet-dark">
                              {voucher.code}
                            </p>
                            <Badge tone={state.tone}>{state.label}</Badge>
                          </div>
                          <p className="mt-0.5 text-[12px]">{voucher.name}</p>
                          <p className="text-[10px] text-muted">
                            {voucher.expires_at
                              ? `Expires ${formatDate(voucher.expires_at)} (${daysUntil(voucher.expires_at)}d)`
                              : "No expiry"}{" "}
                            · min {formatIDR(voucher.min_purchase)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[12px] font-semibold">
                            {voucher.discount_type === "percentage"
                              ? `${voucher.discount_value}%`
                              : formatIDR(voucher.discount_value)}
                          </p>
                          <p className="text-[10px] text-muted">
                            {voucher.used_count} used
                            {voucher.usage_limit ? ` / ${voucher.usage_limit}` : ""}
                          </p>
                        </div>
                      </summary>
                      <div className="border-t border-line/60 bg-mist/20 px-5 py-4">
                        <ActionForm action={saveVoucherAction} className="space-y-4">
                          <input type="hidden" name="id" value={voucher.id} />
                          <VoucherFields voucher={voucher} />
                          <div className="flex flex-wrap items-center gap-2">
                            <SubmitButton size="sm" pendingText="Saving…">
                              Save voucher
                            </SubmitButton>
                            <InlineButton
                              action={deleteVoucherAction.bind(null, voucher.id)}
                              variant="danger-ghost"
                              size="sm"
                              confirm={`Delete voucher ${voucher.code}? Existing redemptions keep their order discount.`}
                              pendingText="Deleting…"
                            >
                              <Trash2 /> Delete
                            </InlineButton>
                          </div>
                        </ActionForm>
                      </div>
                    </details>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="px-5 py-10 text-center text-[13px] text-muted">
              No vouchers yet. Create one on the right to start a campaign.
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-line bg-white p-5">
          <h2 className="flex items-center gap-2 font-display text-base font-semibold">
            <Plus className="size-4 text-violet" /> New voucher
          </h2>
          <p className="mt-1 text-xs text-muted">
            Customers can see public active vouchers on their vouchers page.
          </p>
          <ActionForm action={saveVoucherAction} resetOnSuccess className="mt-4">
            <VoucherFields />
            <div className="mt-4">
              <SubmitButton size="sm" pendingText="Creating…">
                Create voucher
              </SubmitButton>
            </div>
          </ActionForm>
        </section>
      </div>
    </div>
  );
}
