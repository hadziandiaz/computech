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
    <section className={cn("relative overflow-hidden bg-ink text-white", className)}>
      <div className="absolute inset-0 tech-grid opacity-60" aria-hidden />
      <div
        className="absolute -right-20 -top-24 size-[420px] rounded-full bg-violet/20 blur-[110px]"
        aria-hidden
      />
      <div className="container-page relative py-10 lg:py-14">
        {crumbs ? (
          <div className="mb-5 [&_a]:text-white/55 [&_a:hover]:text-white [&_span]:text-white/80 [&_svg]:text-white/25">
            <Breadcrumbs items={crumbs} />
          </div>
        ) : null}
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div className="max-w-3xl">
            {eyebrow ? (
              <p className="eyebrow mb-3 flex items-center gap-2 text-neon">
                <span className="inline-block size-1.5 rounded-full bg-neon" />
                {eyebrow}
              </p>
            ) : null}
            <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              {title}
            </h1>
            {description ? (
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/60 sm:text-[15px]">
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
