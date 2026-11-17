import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  pageCount,
  basePath,
  searchParams,
  className,
}: {
  page: number;
  pageCount: number;
  basePath: string;
  searchParams: Record<string, string | string[] | undefined>;
  className?: string;
}) {
  if (pageCount <= 1) return null;

  function href(target: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (key === "page" || value == null) continue;
      if (Array.isArray(value)) value.forEach((item) => params.append(key, item));
      else params.set(key, value);
    }
    if (target > 1) params.set("page", String(target));
    const query = params.toString();
    return query ? `${basePath}?${query}` : basePath;
  }

  const pages = Array.from({ length: pageCount }, (_, index) => index + 1).filter(
    (item) =>
      item === 1 ||
      item === pageCount ||
      Math.abs(item - page) <= 1,
  );
  const unique = Array.from(new Set(pages)).sort((a, b) => a - b);

  return (
    <nav className={cn("flex flex-wrap items-center justify-center gap-1.5", className)} aria-label="Pagination">
      <Link
        href={href(Math.max(1, page - 1))}
        aria-disabled={page === 1}
        className={cn(
          buttonVariants({ variant: "outline", size: "icon-sm" }),
          page === 1 && "pointer-events-none opacity-40",
        )}
      >
        <ChevronLeft />
        <span className="sr-only">Previous page</span>
      </Link>
      {unique.map((item, index) => {
        const previous = unique[index - 1];
        return (
          <span key={item} className="flex items-center gap-1.5">
            {previous && item - previous > 1 ? (
              <span className="px-1 text-xs text-muted">…</span>
            ) : null}
            <Link
              href={href(item)}
              aria-current={item === page ? "page" : undefined}
              className={cn(
                buttonVariants({
                  variant: item === page ? "primary" : "outline",
                  size: "icon-sm",
                }),
                "text-xs",
              )}
            >
              {item}
            </Link>
          </span>
        );
      })}
      <Link
        href={href(Math.min(pageCount, page + 1))}
        aria-disabled={page === pageCount}
        className={cn(
          buttonVariants({ variant: "outline", size: "icon-sm" }),
          page === pageCount && "pointer-events-none opacity-40",
        )}
      >
        <ChevronRight />
        <span className="sr-only">Next page</span>
      </Link>
    </nav>
  );
}
