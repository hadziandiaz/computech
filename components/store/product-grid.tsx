import { ProductCard } from "@/components/store/product-card";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/domain";

export function ProductGrid({
  products,
  className,
  compact = false,
  savedIds,
}: {
  products: Product[];
  className?: string;
  compact?: boolean;
  savedIds?: string[];
}) {
  const saved = new Set(savedIds ?? []);

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 xl:grid-cols-4",
        className,
      )}
    >
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          priority={index < 4}
          compact={compact}
          saved={saved.has(product.id)}
        />
      ))}
    </div>
  );
}
