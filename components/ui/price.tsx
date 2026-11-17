import { formatIDR } from "@/lib/format";
import { cn } from "@/lib/utils";

export function Price({
  value,
  compareAt,
  size = "md",
  className,
}: {
  value: number;
  compareAt?: number | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const sizes = {
    sm: "text-sm",
    md: "text-[15px]",
    lg: "text-xl",
    xl: "text-3xl",
  };
  return (
    <span className={cn("inline-flex flex-wrap items-baseline gap-2", className)}>
      <span className={cn("font-display font-bold tracking-tight text-ink", sizes[size])}>
        {formatIDR(value)}
      </span>
      {compareAt && compareAt > value ? (
        <span className="text-xs font-medium text-muted line-through">
          {formatIDR(compareAt)}
        </span>
      ) : null}
    </span>
  );
}
