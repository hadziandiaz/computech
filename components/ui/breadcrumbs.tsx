import { ChevronRight } from "lucide-react";
import Link from "next/link";

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-xs text-muted">
      <Link href="/" className="transition-colors hover:text-ink">
        Home
      </Link>
      {items.map((item) => (
        <span key={`${item.label}-${item.href ?? ""}`} className="flex items-center gap-1">
          <ChevronRight className="size-3 text-line" />
          {item.href ? (
            <Link href={item.href} className="transition-colors hover:text-ink">
              {item.label}
            </Link>
          ) : (
            <span className="text-ink">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
