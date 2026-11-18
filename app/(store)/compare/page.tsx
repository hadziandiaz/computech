import { GitCompareArrows } from "lucide-react";

import { PageHero } from "@/components/layout/page-hero";
import { CompareClient } from "@/components/store/compare-client";

export const metadata = {
  title: "Compare products",
  description:
    "Compare up to four COMPUTECH products side by side, including price, stock, warranty, specifications and PC component compatibility.",
};

export default function ComparePage() {
  return (
    <>
      <PageHero
        eyebrow="Side by side"
        title="Compare before you commit."
        description="Selections are stored in this browser only. Differences are highlighted, and PC components get a live compatibility verdict."
        crumbs={[{ label: "Compare" }]}
        aside={
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4">
            <GitCompareArrows className="size-6 text-neon" />
            <div>
              <p className="font-display text-xl font-bold text-white">Up to 4</p>
              <p className="text-[10px] uppercase tracking-[0.14em] text-white/45">Products</p>
            </div>
          </div>
        }
      />

      <div className="container-page py-8 lg:py-12">
        <CompareClient />
        <div className="mt-8 grid gap-3 rounded-2xl border border-line bg-mist/60 p-5 sm:grid-cols-3">
          {[
            {
              title: "Add from anywhere",
              detail: "Use the compare icon on any product card or product page.",
            },
            {
              title: "Differences highlighted",
              detail: "Rows where values differ are tinted for quick scanning.",
            },
            {
              title: "Built for components",
              detail: "Socket, chipset, memory type, wattage and clearance where available.",
            },
          ].map((item) => (
            <div key={item.title}>
              <p className="text-[12px] font-semibold">{item.title}</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-muted">{item.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
