import { Bell, KeyRound, LogOut, Settings2 } from "lucide-react";

import { ActionForm, SubmitButton } from "@/components/ui/action-form";
import { Checkbox, Field, Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import { getAuthUser } from "@/lib/auth";
import {
  changePasswordAction,
  signOutAction,
  updatePreferencesAction,
} from "@/lib/actions/auth";

export const metadata = {
  title: "Account settings",
};

export default async function AccountSettingsPage() {
  const user = await getAuthUser();
  if (!user) return null;

  const profile = user.profile;

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow text-violet">Preferences</p>
        <h1 className="mt-1 flex items-center gap-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
          <Settings2 className="size-6 text-violet" /> Account settings
        </h1>
        <p className="mt-1 text-sm text-muted">
          Control notifications, update your password and manage this session.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <section className="rounded-2xl border border-line bg-white p-5">
          <h2 className="flex items-center gap-2 font-display text-base font-semibold">
            <Bell className="size-4 text-violet" /> Notifications
          </h2>
          <ActionForm action={updatePreferencesAction} className="mt-4 space-y-4">
            <label className="flex items-start gap-3 rounded-xl border border-line p-3">
              <Checkbox
                name="order_updates"
                defaultChecked={profile?.order_updates ?? true}
                className="mt-0.5"
              />
              <span>
                <span className="block text-[13px] font-semibold">Order updates</span>
                <span className="mt-0.5 block text-[11px] leading-relaxed text-muted">
                  Payment confirmations, processing updates and shipment tracking.
                </span>
              </span>
            </label>
            <label className="flex items-start gap-3 rounded-xl border border-line p-3">
              <Checkbox
                name="marketing_opt_in"
                defaultChecked={profile?.marketing_opt_in ?? false}
                className="mt-0.5"
              />
              <span>
                <span className="block text-[13px] font-semibold">Promotions and launches</span>
                <span className="mt-0.5 block text-[11px] leading-relaxed text-muted">
                  Campaigns, new hardware and PC Builder recommendations. No more than two emails a
                  month.
                </span>
              </span>
            </label>
            <SubmitButton pendingText="Saving…">Save preferences</SubmitButton>
          </ActionForm>
        </section>

        <section className="rounded-2xl border border-line bg-white p-5">
          <h2 className="flex items-center gap-2 font-display text-base font-semibold">
            <KeyRound className="size-4 text-violet" /> Change password
          </h2>
          <ActionForm action={changePasswordAction} resetOnSuccess className="mt-4 space-y-4">
            <Field label="Current password" htmlFor="current_password">
              <Input
                id="current_password"
                name="current_password"
                type="password"
                autoComplete="current-password"
                required
              />
            </Field>
            <Field label="New password" htmlFor="password" hint="At least 8 characters.">
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </Field>
            <Field label="Confirm new password" htmlFor="confirm_password">
              <Input
                id="confirm_password"
                name="confirm_password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </Field>
            <SubmitButton pendingText="Updating…">Update password</SubmitButton>
          </ActionForm>
        </section>
      </div>

      <section className="rounded-2xl border border-line bg-white p-5">
        <h2 className="flex items-center gap-2 font-display text-base font-semibold">
          <LogOut className="size-4 text-coral" /> Session
        </h2>
        <p className="mt-2 max-w-2xl text-[12px] leading-relaxed text-muted">
          Signing out clears the authenticated session on this device. Your guest cart is not affected
          because it is merged into your account while signed in.
        </p>
        <form action={signOutAction} className="mt-4">
          <button type="submit" className={buttonVariants({ variant: "danger", size: "sm" })}>
            <LogOut /> Sign out of this device
          </button>
        </form>
      </section>
    </div>
  );
}
