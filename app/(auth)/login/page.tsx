import { ArrowRight, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ActionForm, SubmitButton } from "@/components/ui/action-form";
import { Input, Label } from "@/components/ui/input";
import { signInAction } from "@/lib/actions/auth";
import { getAuthUser, sanitizeNextPath } from "@/lib/auth";

export const metadata = {
  title: "Sign in",
  description: "Sign in to your COMPUTECH account to manage orders, builds and warranty records.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const next = sanitizeNextPath(Array.isArray(params.next) ? params.next[0] : params.next, "/account");
  const user = await getAuthUser();
  if (user) redirect(next);

  return (
    <div>
      <span className="flex size-10 items-center justify-center rounded-xl bg-violet-soft text-violet">
        <LockKeyhole className="size-5" />
      </span>
      <h1 className="mt-4 font-display text-2xl font-bold tracking-tight">Welcome back</h1>
      <p className="mt-1 text-sm text-muted">
        Sign in to continue to your account, cart and orders.
      </p>

      <ActionForm action={signInAction} className="mt-7 space-y-4">
        <input type="hidden" name="next" value={next} />
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
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password" required>
              Password
            </Label>
            <Link href="/forgot-password" className="text-[11px] font-semibold text-violet hover:underline">
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Your password"
            required
            minLength={8}
          />
        </div>
        <SubmitButton className="w-full" pendingText="Signing in…">
          Sign in <ArrowRight />
        </SubmitButton>
      </ActionForm>

      <div className="mt-6 rounded-xl border border-line bg-white p-4 text-[12px] leading-relaxed text-muted">
        <p className="font-semibold text-ink">New to COMPUTECH?</p>
        <p className="mt-0.5">
          Create an account to save builds, keep your cart and track warranty.
        </p>
        <Link
          href={`/register${next !== "/account" ? `?next=${encodeURIComponent(next)}` : ""}`}
          className="mt-2 inline-flex items-center gap-1 font-semibold text-violet hover:underline"
        >
          Create an account <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}
