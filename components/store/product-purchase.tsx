"use client";

import { Loader2, Minus, Plus, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { CompareButton } from "@/components/store/compare-button";
import { WishlistButton } from "@/components/store/wishlist-button";
import { Button } from "@/components/ui/button";
import { addToCartAction } from "@/lib/actions/cart";

export function ProductPurchase({
  productId,
  stock,
  available,
}: {
  productId: string;
  stock: number;
  available: boolean;
}) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [pending, startTransition] = useTransition();
  const max = Math.max(1, Math.min(20, stock));

  function add() {
    if (pending) return;
    startTransition(async () => {
      const result = await addToCartAction(productId, quantity);
      if (result.ok) {
        toast.success(result.message || "Added to cart.");
        router.refresh();
      } else {
        toast.error(result.message || "Could not add this product.");
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-stretch gap-2.5">
        <div className="inline-flex h-12 items-center rounded-full border border-line bg-white">
          <button
            type="button"
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            disabled={quantity <= 1 || !available}
            className="inline-flex size-11 items-center justify-center rounded-full text-ink hover:bg-mist disabled:opacity-40"
            aria-label="Decrease quantity"
          >
            <Minus className="size-4" />
          </button>
          <span className="w-9 text-center text-sm font-semibold" aria-live="polite">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((value) => Math.min(max, value + 1))}
            disabled={quantity >= max || !available}
            className="inline-flex size-11 items-center justify-center rounded-full text-ink hover:bg-mist disabled:opacity-40"
            aria-label="Increase quantity"
          >
            <Plus className="size-4" />
          </button>
        </div>
        <Button
          type="button"
          size="lg"
          onClick={add}
          disabled={pending || !available}
          className="min-w-44 flex-1"
        >
          {pending ? <Loader2 className="animate-spin" /> : <ShoppingCart />}
          {pending ? "Adding…" : available ? "Add to cart" : "Out of stock"}
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        <WishlistButton productId={productId} withLabel />
        <CompareButton productId={productId} withLabel />
      </div>
      {available && stock <= 5 ? (
        <p className="text-xs font-medium text-[#9a6500]">
          Low stock — {stock} unit{stock === 1 ? "" : "s"} available right now.
        </p>
      ) : null}
    </div>
  );
}
