import type { ReactNode } from "react";

import { Breadcrumbs, type Crumb } from "@/components/ui/breadcrumbs";
import { cn } from "@/lib/utils";

export function PageHero({
  eyebrow,
  title,
  description,
  crumbs,
  actions,
  aside,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  crumbs?: Crumb[];
  actions?: ReactNode;
  aside?: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn("noise-layer relative overflow-hidden bg-ink text-white", className)}
    >
      <div className="absolute inset-0 tech-grid opacity-70" aria-hidden />
      <div
        className="absolute -right-24 -top-28 size-[480px] rounded-full bg-violet/30 blur-[120px]"
        aria-hidden
      />
      <div
        className="absolute -bottom-16 left-1/4 h-24 w-[60%] -rotate-3 bg-neon/10 blur-2xl"
        aria-hidden
      />
      <span
        className="absolute bottom-0 left-0 h-2 w-72 -rotate-2 bg-acid"
        aria-hidden
      />
      <span
        className="absolute right-6 top-5 hidden font-mono text-[10px] uppercase tracking-[0.32em] text-white/25 lg:block"
        aria-hidden
      >
        CT / 2026 — live catalog
      </span>

      <div className="container-page relative py-11 lg:py-16">
        {crumbs ? (
          <div className="mb-5 [&_a]:text-white/50 [&_a:hover]:text-white [&_span]:text-white/80 [&_svg]:text-white/25">
            <Breadcrumbs items={crumbs} />
          </div>
        ) : null}
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div className="max-w-3xl">
            {eyebrow ? (
              <p className="eyebrow mb-3 flex items-center gap-2.5 text-neon">
                <span className="size-2 rotate-45 bg-acid" />
                {eyebrow}
              </p>
            ) : null}
            <div className="relative isolate inline-block">
              <span
                className="absolute bottom-1 left-0 -z-10 h-3 w-[72%] -rotate-1 bg-acid/90"
                aria-hidden
              />
              <h1 className="font-display text-4xl font-black uppercase leading-[1.02] tracking-[-0.055em] sm:text-5xl lg:text-6xl">
                {title}
              </h1>
            </div>
            {description ? (
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/60 sm:text-[15px]">
                {description}
              </p>
            ) : null}
            {actions ? <div className="mt-6 flex flex-wrap gap-3">{actions}</div> : null}
          </div>
          {aside ? <div className="shrink-0">{aside}</div> : null}
        </div>
      </div>
    </section>
  );
}
