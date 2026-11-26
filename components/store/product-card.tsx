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
        "group relative flex h-full flex-col overflow-hidden rounded-xl border border-line bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-violet/40 hover:shadow-lg",
        className,
      )}
    >
      <div className="absolute right-2 top-2 z-10 flex flex-col gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
        <WishlistButton
          productId={product.id}
          initialSaved={saved}
          className="size-8 rounded-full border border-line bg-white/95 shadow-sm hover:border-coral sm:size-9"
        />
        <CompareButton
          productId={product.id}
          className="size-8 rounded-full border border-line bg-white/95 shadow-sm hover:border-violet sm:size-9"
        />
      </div>

      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-mist"
        aria-label={product.name}
      >
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            priority={priority}
            sizes="(min-width: 1280px) 210px, (min-width: 1024px) 25vw, (min-width: 640px) 32vw, 48vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <span className="flex h-full items-center justify-center text-muted/40">
            <ImageIcon className="size-8" />
          </span>
        )}
        <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
          {discount > 0 ? (
            <Badge tone="coral" className="border-0 bg-coral px-1.5 py-0.5 text-[10px] font-bold text-white">
              −{discount}%
            </Badge>
          ) : null}
          {product.promotion ? (
            <Badge className="max-w-[7.5rem] truncate border-0 bg-violet px-1.5 py-0.5 text-[10px] font-semibold text-white">
              {product.promotion.name}
            </Badge>
          ) : null}
          {product.is_demo ? (
            <Badge className="border-0 bg-ink/80 px-1.5 py-0.5 text-[9px] font-semibold text-white">
              Demo
            </Badge>
          ) : null}
        </div>
        {!available ? (
          <span className="absolute inset-x-0 bottom-0 bg-ink/85 py-1 text-center text-[10px] font-bold uppercase tracking-wide text-white">
            Habis
          </span>
        ) : lowStock ? (
          <span className="absolute inset-x-0 bottom-0 bg-coral py-1 text-center text-[10px] font-bold uppercase tracking-wide text-white">
            Sisa {stock}
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col p-2.5 sm:p-3">
        <span className="truncate text-[10px] font-semibold uppercase tracking-wide text-violet-dark">
          {product.brand?.name ?? product.category?.name ?? "COMPUTECH"}
        </span>
        <Link href={`/products/${product.slug}`} className="mt-0.5 block">
          <h3
            className={cn(
              "line-clamp-2 text-[12px] font-semibold leading-snug text-ink transition-colors group-hover:text-violet-dark sm:text-[13px]",
              compact && "sm:text-[12px]",
            )}
          >
            {product.name}
          </h3>
        </Link>

        {!compact && product.short_description ? (
          <p className="mt-1 hidden line-clamp-1 text-[11px] text-muted sm:block">
            {product.short_description}
          </p>
        ) : null}

        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <Rating value={product.rating} count={product.review_count} className="[&_svg]:size-3" />
          {product.sold_count > 0 ? (
            <span className="text-[10px] text-muted">
              {product.sold_count >= 1000
                ? `${(product.sold_count / 1000).toFixed(1)}k`
                : product.sold_count}{" "}
              terjual
            </span>
          ) : null}
        </div>

        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div className="min-w-0">
            <Price
              value={price}
              compareAt={price < product.price ? product.price : null}
              size="md"
              className="[&>span:first-child]:!text-coral [&>span:last-child]:text-[10px]"
            />
          </div>
          <AddToCartButton
            productId={product.id}
            iconOnly
            size="icon-sm"
            label="Add to cart"
            outOfStock={!available}
            className="size-8 shrink-0 rounded-full bg-violet text-white shadow-sm hover:bg-violet-dark"
          />
        </div>
      </div>
      <span className="sr-only">{formatIDR(price)}</span>
    </article>
  );
}
