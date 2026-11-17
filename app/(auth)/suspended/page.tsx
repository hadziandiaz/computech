import { LifeBuoy, ShieldOff } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export const metadata = {
  title: "Account suspended",
  description: "This COMPUTECH account has been suspended.",
};

export default function SuspendedPage() {
  return (
    <div>
      <span className="flex size-10 items-center justify-center rounded-xl bg-coral-soft text-coral">
        <ShieldOff className="size-5" />
      </span>
      <h1 className="mt-4 font-display text-2xl font-bold tracking-tight">Account suspended</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        This account cannot place orders or access account pages while it is suspended. If you
        believe this is a mistake, contact support with the email address on the account.
      </p>

      <div className="mt-6 rounded-xl border border-line bg-white p-4">
        <p className="flex items-center gap-2 text-[13px] font-semibold">
          <LifeBuoy className="size-4 text-violet" /> Need help?
        </p>
        <p className="mt-1 text-[12px] leading-relaxed text-muted">
          Send a message and the team can review the account status.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href="/contact" className={buttonVariants({ size: "sm" })}>
            Contact support
          </Link>
          <Link href="/" className={buttonVariants({ variant: "outline", size: "sm" })}>
            Return to store
          </Link>
        </div>
      </div>
    </div>
  );
}
