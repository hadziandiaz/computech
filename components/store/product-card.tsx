import { ImageIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { AddToCartButton } from "@/components/store/add-to-cart-button";
import { CompareButton } from "@/components/store/compare-button";
import { WishlistButton } from "@/components/store/wishlist-button";
import { Badge } from "@/components/ui/badge";
import { Price } from "@/components/ui/price";
import { Rating } from "@/components/ui/rating";
import { inStock, primaryImage, stockOf } from "@/lib/data/mappers";
import { discountPercent, formatIDR } from "@/lib/format";
import { productUnitPrice } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/domain";

export function ProductCard({
  product,
  className,
  priority = false,
  compact = false,
  saved = false,
}: {
  product: Product;
  className?: string;
  priority?: boolean;
  compact?: boolean;
  saved?: boolean;
}) {
  const image = primaryImage(product);
  const price = product.effective_price ?? productUnitPrice(product);
  const stock = stockOf(product);
  const available = inStock(product);
  const discount = discountPercent(product.price, price < product.price ? price : null);
  const lowStock = available && stock <= 3;

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-[22px] border-2 border-ink bg-white shadow-[4px_4px_0_0_#111126] transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-1 hover:shadow-[7px_7px_0_0_#7957ff]",
        className,
      )}
    >
      <div className="absolute right-2.5 top-2.5 z-10 flex flex-col gap-1.5 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
        <WishlistButton
          productId={product.id}
          initialSaved={saved}
          className="rounded-xl border-2 border-ink bg-white shadow-[2px_2px_0_0_#111126] hover:border-coral"
        />
        <CompareButton
          productId={product.id}
          className="rounded-xl border-2 border-ink bg-white shadow-[2px_2px_0_0_#111126] hover:border-violet"
        />
      </div>

      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-[4/3] overflow-hidden bg-mist"
        aria-label={product.name}
      >
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            priority={priority}
            sizes="(min-width: 1280px) 280px, (min-width: 768px) 33vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.035]"
          />
        ) : (
          <span className="flex h-full items-center justify-center text-muted/50">
            <ImageIcon className="size-9" />
          </span>
        )}
        <div className="absolute left-2.5 top-2.5 flex flex-col items-start gap-1.5">
          {discount > 0 ? (
            <Badge
              tone="acid"
              className="border-2 border-ink px-2 py-0.5 font-mono text-[11px] font-black uppercase tracking-[0.08em] shadow-[2px_2px_0_0_#111126]"
            >
              −{discount}%
            </Badge>
          ) : null}
          {product.promotion ? (
            <Badge
              tone="neutral"
              className="max-w-[10rem] truncate border-2 border-ink bg-white font-black uppercase tracking-[0.08em] text-ink shadow-[2px_2px_0_0_#7957ff]"
            >
              {product.promotion.name}
            </Badge>
          ) : null}
          {product.is_demo ? (
            <Badge
              tone="neutral"
              className="border-2 border-ink bg-acid font-black uppercase tracking-[0.08em] text-ink shadow-[2px_2px_0_0_#111126]"
            >
              Demo
            </Badge>
          ) : null}
        </div>
        {!available ? (
          <span className="absolute inset-x-0 bottom-0 border-t-2 border-ink bg-ink/90 py-1.5 text-center text-[10px] font-black uppercase tracking-[0.16em] text-white">
            Out of stock
          </span>
        ) : lowStock ? (
          <span className="absolute inset-x-0 bottom-0 border-t-2 border-ink bg-coral py-1.5 text-center text-[10px] font-black uppercase tracking-[0.16em] text-white">
            Only {stock} left
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        <div className="flex items-center justify-between gap-2 text-[11px] text-muted">
          <span className="truncate font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-violet-dark">
            {product.brand?.name ?? product.category?.name ?? "COMPUTECH"}
          </span>
          <span className="shrink-0 font-mono text-[10px] text-muted/70">{product.sku}</span>
        </div>

        <Link href={`/products/${product.slug}`} className="mt-1.5 block">
          <h3
            className={cn(
              "line-clamp-2 font-display text-[15px] font-black uppercase leading-tight tracking-[-0.02em] text-ink transition-colors group-hover:text-violet-dark",
              compact && "text-sm",
            )}
          >
            {product.name}
          </h3>
        </Link>

        {!compact && product.short_description ? (
          <p className="mt-1.5 line-clamp-2 text-[12px] leading-relaxed text-muted">
            {product.short_description}
          </p>
        ) : null}

        <div className="mt-2 flex items-center gap-2">
          <Rating value={product.rating} count={product.review_count} />
          {product.sold_count > 0 ? (
            <span className="text-[11px] text-muted">
              {product.sold_count >= 1000
                ? `${(product.sold_count / 1000).toFixed(1)}k`
                : product.sold_count}{" "}
              sold
            </span>
          ) : null}
        </div>

        <div className="mt-auto flex items-end justify-between gap-2 border-t-2 border-ink pt-3">
          <div className="min-w-0">
            <Price value={price} compareAt={price < product.price ? product.price : null} size="md" />
            {product.warranty_months > 0 ? (
              <p className="mt-0.5 text-[10px] text-muted">
                {product.warranty_months}-month {product.warranty_type} warranty
              </p>
            ) : null}
          </div>
          <AddToCartButton
            productId={product.id}
            iconOnly
            size="icon"
            label="Add to cart"
            outOfStock={!available}
            className="size-10 rounded-xl border-2 border-ink shadow-[3px_3px_0_0_#111126] transition-transform hover:-translate-y-0.5 hover:translate-x-0.5"
          />
        </div>
      </div>
      <span className="sr-only">{formatIDR(price)}</span>
    </article>
  );
}
