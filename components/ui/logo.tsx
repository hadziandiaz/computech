import Link from "next/link";

import { cn } from "@/lib/utils";

export function Logo({
  className,
  tone = "dark",
  compact = false,
}: {
  className?: string;
  tone?: "dark" | "light";
  compact?: boolean;
}) {
  return (
    <Link
      href="/"
      aria-label="COMPUTECH home"
      className={cn("group inline-flex items-center gap-2", className)}
    >
      <span className="relative flex size-9 items-center justify-center overflow-hidden rounded-lg bg-violet transition-colors group-hover:bg-violet-dark">
        <svg viewBox="0 0 32 32" className="size-6" aria-hidden>
          <path
            d="M23 9.5a8.5 8.5 0 1 0 0 13"
            fill="none"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="square"
          />
          <rect x="21" y="13.5" width="6" height="5" fill="#35D6ED" />
        </svg>
        <span className="absolute right-0 top-0 size-1.5 bg-acid" aria-hidden />
      </span>
      {!compact ? (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              "font-display text-[18px] font-bold tracking-[0.04em]",
              tone === "dark" ? "text-ink" : "text-white",
            )}
          >
            COMPUTECH
          </span>
          <span
            className={cn(
              "mt-0.5 font-mono text-[8px] uppercase tracking-[0.2em]",
              tone === "dark" ? "text-muted" : "text-white/50",
            )}
          >
            Build · Perform
          </span>
        </span>
      ) : null}
    </Link>
  );
}
