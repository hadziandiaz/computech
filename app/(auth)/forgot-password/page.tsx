import { ArrowLeft, KeyRound, Mail } from "lucide-react";
import Link from "next/link";

import { ActionForm, SubmitButton } from "@/components/ui/action-form";
import { Input, Label } from "@/components/ui/input";
import { requestPasswordResetAction } from "@/lib/actions/auth";

export const metadata = {
  title: "Forgot password",
  description: "Request a password reset link for your COMPUTECH account.",
};

export default function ForgotPasswordPage() {
  return (
    <div>
      <span className="flex size-10 items-center justify-center rounded-xl bg-violet-soft text-violet">
        <KeyRound className="size-5" />
      </span>
      <h1 className="mt-4 font-display text-2xl font-bold tracking-tight">Reset your password</h1>
      <p className="mt-1 text-sm text-muted">
        Enter the email on your account and we will send a reset link if it exists.
      </p>

      <ActionForm action={requestPasswordResetAction} className="mt-7 space-y-4" resetOnSuccess>
        <div>
          <Label htmlFor="email" required>
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
          />
        </div>
        <SubmitButton className="w-full" pendingText="Sending link…">
          <Mail /> Send reset link
        </SubmitButton>
      </ActionForm>

      <p className="mt-4 text-[11px] leading-relaxed text-muted">
        For security, the same confirmation is shown whether or not an account exists for the
        address.
      </p>

      <Link
        href="/login"
        className="mt-6 inline-flex items-center gap-1 text-[12px] font-semibold text-violet hover:underline"
      >
        <ArrowLeft className="size-3.5" /> Back to sign in
      </Link>
    </div>
  );
}
