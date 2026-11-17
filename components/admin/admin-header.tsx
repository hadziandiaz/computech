import type { ReactNode } from "react";

export function AdminHeader({
  eyebrow = "Console",
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-violet">{eyebrow}</p>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight sm:text-[28px]">{title}</h1>
        {description ? (
          <p className="mt-1 max-w-3xl text-[13px] leading-relaxed text-muted">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}
