import { Cpu, ShieldCheck, ShoppingBag, Sparkles } from "lucide-react";
import Link from "next/link";

import { Logo } from "@/components/ui/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-ink p-10 text-white lg:flex lg:flex-col">
        <div className="absolute inset-0 tech-grid opacity-60" aria-hidden />
        <div
          className="absolute -left-24 top-1/3 size-[420px] rounded-full bg-violet/25 blur-[120px]"
          aria-hidden
        />
        <div className="relative">
          <Logo tone="light" />
        </div>

        <div className="relative my-auto max-w-md py-10">
          <p className="eyebrow flex items-center gap-2 text-neon">
            <span className="inline-block size-1.5 rounded-full bg-neon" />
            Account access
          </p>
          <h1 className="display-md mt-4 text-white">
            One account for orders, builds and warranty.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-white/55">
            Sign in to check out, keep a cart across devices, save PC builds, follow deliveries and
            keep every warranty record in one place.
          </p>

          <div className="mt-8 space-y-3">
            {[
              { icon: ShoppingBag, title: "Orders and payments", detail: "Status, payment instructions, tracking and cancellation." },
              { icon: Cpu, title: "Saved PC builds", detail: "Keep private builds, share a public link or print a parts list." },
              { icon: ShieldCheck, title: "Warranty records", detail: "Per-line warranty terms copied from the order." },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3.5">
                <item.icon className="mt-0.5 size-4 shrink-0 text-neon" />
                <div>
                  <p className="text-[12px] font-semibold">{item.title}</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-white/45">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex items-center gap-2 text-[11px] text-white/35">
          <Sparkles className="size-3.5 text-violet" />
          <span>COMPUTECH · Build Your Setup. Define Your Performance.</span>
        </div>
      </aside>

      <main className="flex flex-col bg-mist">
        <div className="flex items-center justify-between border-b border-line bg-white px-5 py-4 lg:hidden">
          <Logo />
          <Link href="/products" className="text-[12px] font-semibold text-violet">
            Shop
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-[420px]">{children}</div>
        </div>
        <div className="px-5 pb-6 text-center text-[11px] text-muted">
          <Link href="/" className="font-semibold text-violet hover:underline">
            Back to the store
          </Link>
          <span className="mx-2 text-line">|</span>
          <Link href="/privacy" className="hover:text-ink">
            Privacy
          </Link>
          <span className="mx-2 text-line">|</span>
          <Link href="/terms" className="hover:text-ink">
            Terms
          </Link>
        </div>
      </main>
    </div>
  );
}
