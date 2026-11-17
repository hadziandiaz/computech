import { Mail, ShieldCheck, UserRound } from "lucide-react";
import Link from "next/link";

import { ActionForm, SubmitButton } from "@/components/ui/action-form";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";
import { getAuthUser } from "@/lib/auth";
import { updateProfileAction } from "@/lib/actions/auth";
import { formatDate } from "@/lib/format";
import { initials } from "@/lib/utils";

export const metadata = {
  title: "My profile",
};

export default async function AccountProfilePage() {
  const user = await getAuthUser();
  if (!user) return null;

  const profile = user.profile;
  const name = profile?.full_name?.trim() || user.email.split("@")[0] || "Customer";

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow text-violet">Identity</p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-3xl">
          My profile
        </h1>
        <p className="mt-1 text-sm text-muted">
          Your name and phone number are used on orders and warranty records.
        </p>
      </header>

      <section className="rounded-2xl border border-line bg-white p-5">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex size-16 items-center justify-center rounded-2xl bg-ink font-display text-xl font-bold text-white">
            {initials(name)}
          </span>
          <div className="min-w-0">
            <p className="font-display text-lg font-bold">{name}</p>
            <p className="text-[12px] text-muted">{user.email}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <Badge tone={user.role === "admin" ? "dark" : user.role === "staff" ? "cyan" : "neutral"}>
                {user.role}
              </Badge>
              {profile?.is_suspended ? <Badge tone="coral">Suspended</Badge> : null}
              <span className="text-[11px] text-muted">
                Member since {profile ? formatDate(profile.created_at) : "—"}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-start">
        <section className="rounded-2xl border border-line bg-white p-5">
          <h2 className="flex items-center gap-2 font-display text-base font-semibold">
            <UserRound className="size-4 text-violet" /> Personal details
          </h2>
          <ActionForm action={updateProfileAction} className="mt-4 space-y-4">
            <Field label="Full name" htmlFor="full_name">
              <Input
                id="full_name"
                name="full_name"
                defaultValue={profile?.full_name ?? ""}
                autoComplete="name"
                required
              />
            </Field>
            <Field label="Phone number" htmlFor="phone" hint="Include the country code where relevant.">
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={profile?.phone ?? ""}
                autoComplete="tel"
                placeholder="+62 812 3456 7890"
              />
            </Field>
            <Field label="Email address" htmlFor="email" hint="Contact support to change the sign-in email.">
              <Input id="email" name="email" defaultValue={user.email} disabled />
            </Field>
            <SubmitButton pendingText="Saving…">Save profile</SubmitButton>
          </ActionForm>
        </section>

        <div className="space-y-6">
          <section className="rounded-2xl border border-line bg-white p-5">
            <h2 className="flex items-center gap-2 font-display text-base font-semibold">
              <Mail className="size-4 text-violet" /> Contact details
            </h2>
            <p className="mt-2 text-[12px] leading-relaxed text-muted">
              The email address on your account is used for order receipts, payment reminders and
              password resets. Keep your phone number current so couriers can reach you.
            </p>
          </section>

          <section className="rounded-2xl border border-line bg-white p-5">
            <h2 className="flex items-center gap-2 font-display text-base font-semibold">
              <ShieldCheck className="size-4 text-violet" /> Security
            </h2>
            <p className="mt-2 text-[12px] leading-relaxed text-muted">
              Change your password and marketing preferences from account settings.
            </p>
            <Link
              href="/account/settings"
              className={`${buttonVariants({ variant: "outline", size: "sm" })} mt-3`}
            >
              Open settings
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
