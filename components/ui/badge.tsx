import type * as React from "react";

import { cn } from "@/lib/utils";

const tones = {
  neutral: "bg-mist text-ink border-line",
  violet: "bg-violet-soft text-violet-dark border-violet/20",
  cyan: "bg-neon-soft text-[#0e7e8f] border-neon/30",
  coral: "bg-coral-soft text-[#c4404b] border-coral/25",
  success: "bg-[#e9f9ef] text-[#18794e] border-[#b8ebc9]",
  warning: "bg-[#fff7e6] text-[#9a6500] border-[#f5dfa6]",
  dark: "bg-ink text-white border-ink",
} as const;

export type BadgeTone = keyof typeof tones;

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function statusTone(status: string): BadgeTone {
  switch (status) {
    case "paid":
    case "completed":
    case "delivered":
    case "resolved":
    case "active":
      return "success";
    case "pending":
    case "new":
    case "warning":
    case "processing":
      return "warning";
    case "shipped":
    case "in_transit":
    case "confirmed":
    case "in_progress":
      return "cyan";
    case "cancelled":
    case "failed":
    case "expired":
    case "returned":
    case "refunded":
    case "suspended":
      return "coral";
    default:
      return "neutral";
  }
}
