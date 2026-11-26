import { KeyRound, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ActionForm, SubmitButton } from "@/components/ui/action-form";
import { Input, Label } from "@/components/ui/input";
import { updatePasswordAction } from "@/lib/actions/auth";
import { getAuthUser } from "@/lib/auth";

export const metadata = {
  title: "Set a new password",
  description: "Choose a new password for your COMPUTECH account.",
};

// This page depends on the recovery session cookie. Without this, Next may
// prerender a permanent redirect to /forgot-password at build time.
export const dynamic = "force-dynamic";

export default async function ResetPasswordPage() {
  const user = await getAuthUser();
  if (!user) redirect("/forgot-password");

  return (
    <div>
      <span className="flex size-10 items-center justify-center rounded-xl bg-violet-soft text-violet">
        <ShieldCheck className="size-5" />
      </span>
      <h1 className="mt-4 font-display text-2xl font-bold tracking-tight">Set a new password</h1>
      <p className="mt-1 text-sm text-muted">
        You are signed in as <span className="font-semibold text-ink">{user.email}</span>. Choose a new
        password, then sign in again.
      </p>

      <ActionForm action={updatePasswordAction} className="mt-7 space-y-4">
        <div>
          <Label htmlFor="password" required>
            New password
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            placeholder="At least 8 characters"
            required
          />
        </div>
        <div>
          <Label htmlFor="confirm_password" required>
            Confirm new password
          </Label>
          <Input
            id="confirm_password"
            name="confirm_password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            placeholder="Repeat new password"
            required
          />
        </div>
        <SubmitButton className="w-full" pendingText="Updating…">
          <KeyRound /> Update password
        </SubmitButton>
      </ActionForm>

      <Link href="/login" className="mt-6 inline-block text-[12px] font-semibold text-violet hover:underline">
        Return to sign in
      </Link>
    </div>
  );
}
