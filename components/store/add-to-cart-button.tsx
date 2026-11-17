"use client";

import { Loader2, Plus, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import type { VariantProps } from "class-variance-authority";

import { Button, buttonVariants } from "@/components/ui/button";
import { addToCartAction } from "@/lib/actions/cart";
import { cn } from "@/lib/utils";

type ButtonProps = {
  productId: string;
  quantity?: number;
  label?: string;
  pendingLabel?: string;
  variant?: VariantProps<typeof buttonVariants>["variant"];
  size?: VariantProps<typeof buttonVariants>["size"];
  className?: string;
  iconOnly?: boolean;
  disabled?: boolean;
  outOfStock?: boolean;
};

export function AddToCartButton({
  productId,
  quantity = 1,
  label = "Add to cart",
  pendingLabel = "Adding…",
  variant = "primary",
  size = "md",
  className,
  iconOnly = false,
  disabled = false,
  outOfStock = false,
}: ButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

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

  if (iconOnly) {
    return (
      <button
        type="button"
        onClick={add}
        disabled={pending || disabled || outOfStock}
        aria-label={outOfStock ? "Out of stock" : label}
        className={cn(
          buttonVariants({ variant, size: "icon" }),
          "shrink-0",
          className,
        )}
      >
        {pending ? <Loader2 className="animate-spin" /> : <ShoppingCart />}
      </button>
    );
  }

  return (
    <Button
      type="button"
      onClick={add}
      disabled={pending || disabled || outOfStock}
      variant={variant}
      size={size}
      className={className}
    >
      {pending ? (
        <Loader2 className="animate-spin" />
      ) : outOfStock ? (
        <ShoppingCart />
      ) : (
        <Plus />
      )}
      {pending ? pendingLabel : outOfStock ? "Out of stock" : label}
    </Button>
  );
}
