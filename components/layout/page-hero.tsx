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
    <section className={cn("border-b border-line bg-white", className)}>
      <div className="container-page py-6 lg:py-8">
        {crumbs ? (
          <div className="mb-4">
            <Breadcrumbs items={crumbs} />
          </div>
        ) : null}
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div className="max-w-3xl">
            {eyebrow ? (
              <p className="mb-1.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-violet">
                <span className="h-3 w-1 rounded-full bg-violet" />
                {eyebrow}
              </p>
            ) : null}
            <h1 className="font-display text-2xl font-bold leading-tight tracking-tight text-ink sm:text-3xl">
              {title}
            </h1>
            {description ? (
              <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-muted sm:text-sm">
                {description}
              </p>
            ) : null}
            {actions ? <div className="mt-4 flex flex-wrap gap-2">{actions}</div> : null}
          </div>
          {aside ? (
            <div className="shrink-0 rounded-xl bg-ink p-1 text-white shadow-sm">{aside}</div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
