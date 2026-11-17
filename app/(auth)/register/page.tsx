import { ArrowRight, UserPlus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ActionForm, SubmitButton } from "@/components/ui/action-form";
import { Input, Label } from "@/components/ui/input";
import { signUpAction } from "@/lib/actions/auth";
import { getAuthUser, sanitizeNextPath } from "@/lib/auth";

export const metadata = {
  title: "Create an account",
  description: "Create a COMPUTECH account for orders, saved builds, warranty and faster checkout.",
};

export default async function RegisterPage({
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
        <UserPlus className="size-5" />
      </span>
      <h1 className="mt-4 font-display text-2xl font-bold tracking-tight">Create your account</h1>
      <p className="mt-1 text-sm text-muted">
        Keep your cart, save builds and follow every order in one place.
      </p>

      <ActionForm action={signUpAction} className="mt-7 space-y-4">
        <input type="hidden" name="next" value={next} />
        <div>
          <Label htmlFor="full_name" required>
            Full name
          </Label>
          <Input
            id="full_name"
            name="full_name"
            autoComplete="name"
            placeholder="Your name"
            required
            minLength={2}
          />
        </div>
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
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="password" required>
              Password
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
              Confirm password
            </Label>
            <Input
              id="confirm_password"
              name="confirm_password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              placeholder="Repeat password"
              required
            />
          </div>
        </div>
        <SubmitButton className="w-full" pendingText="Creating account…">
          Create account <ArrowRight />
        </SubmitButton>
      </ActionForm>

      <p className="mt-4 text-[11px] leading-relaxed text-muted">
        By creating an account you agree to the{" "}
        <Link href="/terms" className="font-semibold text-violet hover:underline">
          terms of service
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="font-semibold text-violet hover:underline">
          privacy policy
        </Link>
        .
      </p>

      <div className="mt-6 rounded-xl border border-line bg-white p-4 text-[12px] leading-relaxed text-muted">
        <p className="font-semibold text-ink">Already have an account?</p>
        <Link
          href={`/login${next !== "/account" ? `?next=${encodeURIComponent(next)}` : ""}`}
          className="mt-2 inline-flex items-center gap-1 font-semibold text-violet hover:underline"
        >
          Sign in instead <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}
