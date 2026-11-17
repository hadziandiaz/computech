import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

export function Rating({
  value,
  count,
  size = "sm",
  className,
  showValue = true,
}: {
  value: number;
  count?: number;
  size?: "sm" | "md";
  className?: string;
  showValue?: boolean;
}) {
  const stars = Math.round(value);
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span className="flex items-center gap-0.5" aria-hidden>
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            className={cn(
              size === "sm" ? "size-3.5" : "size-4",
              index < stars
                ? "fill-[#F5B301] text-[#F5B301]"
                : "fill-line text-line",
            )}
          />
        ))}
      </span>
      {showValue ? (
        <span className="text-xs font-medium text-muted">
          {value > 0 ? value.toFixed(1) : "New"}
          {typeof count === "number" && count > 0 ? ` (${count})` : ""}
        </span>
      ) : (
        <span className="sr-only">
          {value} out of 5{typeof count === "number" ? `, ${count} reviews` : ""}
        </span>
      )}
    </span>
  );
}
