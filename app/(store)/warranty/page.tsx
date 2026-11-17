import { CalendarClock, CheckCircle2, FileCheck2, ShieldCheck, Wrench } from "lucide-react";
import Link from "next/link";

import { PageHero } from "@/components/layout/page-hero";
import { buttonVariants } from "@/components/ui/button";

export const metadata = {
  title: "Warranty",
  description:
    "How COMPUTECH records warranty type, duration and provider on products and orders, and how to make a claim.",
};

const types = [
  {
    name: "Manufacturer",
    detail: "The brand services the claim. Keep the retail box, serial number and proof of purchase.",
  },
  {
    name: "Distributor",
    detail: "The authorised distributor handles the claim. Turnaround follows their service centre.",
  },
  {
    name: "Store",
    detail: "COMPUTECH handles the claim directly and coordinates repair or replacement.",
  },
  {
    name: "No warranty",
    detail: "Used, clearance or consumable items may be sold without warranty. This is shown on the product page.",
  },
];

const steps = [
  {
    icon: FileCheck2,
    title: "Find your order",
    detail: "Your order page lists each line with the warranty months captured at the time of purchase.",
  },
  {
    icon: Wrench,
    title: "Describe the fault",
    detail: "Send the order number, product SKU, serial number and a clear description of the fault.",
  },
  {
    icon: ShieldCheck,
    title: "Assessment",
    detail: "The provider inspects the item. Physical damage and unauthorised repairs are excluded.",
  },
  {
    icon: CalendarClock,
    title: "Resolution",
    detail: "Repair, replacement or refund is recorded against the claim and communicated by email.",
  },
];

export default function WarrantyPage() {
  return (
    <>
      <PageHero
        eyebrow="Warranty"
        title={
          <>
            Terms attached
            <br />
            <span className="text-violet">to the order, not a footnote.</span>
          </>
        }
        description="Every product records a warranty type, duration and provider. Those terms are copied onto your order so support can answer without guessing."
        crumbs={[{ label: "Warranty" }]}
        aside={
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">
              <ShieldCheck className="size-3.5 text-neon" /> Covered by record
            </p>
            <p className="mt-2 text-sm leading-relaxed text-white/65">
              Warranty start and end dates are generated from the completed order, using the
              duration stored on the product at purchase time.
            </p>
          </div>
        }
      />

      <div className="container-page py-10 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.72fr] lg:items-start">
          <div>
            <h2 className="font-display text-xl font-semibold">Warranty types</h2>
            <p className="mt-1 text-sm text-muted">
              The product page shows what applies before you buy. The order keeps a copy of it.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {types.map((type) => (
                <div key={type.name} className="rounded-2xl border border-line bg-white p-4">
                  <CheckCircle2 className="size-4 text-violet" />
                  <p className="mt-2 text-[13px] font-semibold">{type.name} warranty</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-muted">{type.detail}</p>
                </div>
              ))}
            </div>

            <h2 className="mt-9 font-display text-xl font-semibold">Making a claim</h2>
            <ol className="mt-4 space-y-3">
              {steps.map((step, index) => (
                <li key={step.title} className="flex gap-3 rounded-2xl border border-line bg-white p-4">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-ink font-display text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <div>
                    <p className="flex items-center gap-2 text-[13px] font-semibold">
                      <step.icon className="size-3.5 text-violet" /> {step.title}
                    </p>
                    <p className="mt-1 text-[12px] leading-relaxed text-muted">{step.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <aside className="space-y-3 lg:sticky lg:top-28">
            <div className="rounded-2xl border border-line bg-white p-5">
              <h2 className="font-display text-base font-semibold">What is not covered</h2>
              <ul className="mt-3 space-y-2 text-[12px] leading-relaxed text-muted">
                <li>Physical damage, liquid damage or damage from incorrect installation.</li>
                <li>Unauthorised repairs or modifications outside the manufacturer&apos;s guidance.</li>
                <li>Normal wear on consumables such as fans, thermal paste and batteries beyond their stated life.</li>
                <li>Software issues, data loss or incompatibility with third-party components.</li>
                <li>Items sold explicitly without warranty.</li>
              </ul>
            </div>
            <div className="rounded-2xl bg-ink p-5 text-white">
              <h2 className="font-display text-base font-semibold">Start a claim</h2>
              <p className="mt-1 text-[12px] leading-relaxed text-white/55">
                Have your order number, SKU and a description of the fault ready.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/contact" className={buttonVariants({ size: "sm" })}>
                  Contact support
                </Link>
                <Link
                  href="/account/orders"
                  className={buttonVariants({
                    variant: "outline",
                    size: "sm",
                    className: "border-white/20 bg-transparent text-white hover:border-white/40 hover:bg-white/10",
                  })}
                >
                  My orders
                </Link>
              </div>
            </div>
            <div className="rounded-2xl border border-line bg-mist/60 p-4 text-[12px] leading-relaxed text-muted">
              Warranty is recorded per order line. If a product is replaced, the replacement is
              handled as a new claim outcome by staff and noted against the order.
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
