"use client";

import { Loader2, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Price } from "@/components/ui/price";
import {
  clearCartAction,
  removeFromCartAction,
  updateCartQuantityAction,
} from "@/lib/actions/cart";
import type { CartLine } from "@/types/domain";

function CartRow({ line }: { line: CartLine }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const image = line.product.images?.[0]?.url;
  const max = Math.max(1, Math.min(99, line.stock));

  function update(quantity: number) {
    if (pending) return;
    startTransition(async () => {
      const result = await updateCartQuantityAction(line.product.id, quantity);
      if (result.ok) router.refresh();
      else toast.error(result.message || "Could not update the cart.");
    });
  }

  function remove() {
    if (pending) return;
    startTransition(async () => {
      const result = await removeFromCartAction(line.product.id);
      if (result.ok) {
        toast.success(result.message || "Item removed.");
        router.refresh();
      } else {
        toast.error(result.message || "Could not remove the item.");
      }
    });
  }

  return (
    <li className="flex gap-3 p-4 sm:gap-4">
      <Link
        href={`/products/${line.product.slug}`}
        className="relative size-20 shrink-0 overflow-hidden rounded-xl border border-line bg-mist sm:size-24"
      >
        {image ? (
          <Image src={image} alt={line.product.name} fill sizes="96px" className="object-cover" />
        ) : (
          <span className="flex h-full items-center justify-center text-muted/50">
            <ShoppingBag className="size-6" />
          </span>
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">
              {line.product.brand?.name || line.product.category?.name || "COMPUTECH"}
            </p>
            <Link
              href={`/products/${line.product.slug}`}
              className="mt-0.5 line-clamp-2 text-[13px] font-semibold leading-snug hover:text-violet"
            >
              {line.product.name}
            </Link>
            <p className="mt-0.5 font-mono text-[10px] text-muted">{line.product.sku}</p>
          </div>
          <button
            type="button"
            onClick={remove}
            disabled={pending}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-coral-soft hover:text-coral disabled:opacity-40"
            aria-label={`Remove ${line.product.name}`}
          >
            <Trash2 className="size-4" />
          </button>
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex h-8 items-center rounded-full border border-line bg-white">
            <button
              type="button"
              onClick={() => update(line.quantity - 1)}
              disabled={pending || line.quantity <= 1}
              className="inline-flex size-8 items-center justify-center rounded-full hover:bg-mist disabled:opacity-40"
              aria-label="Decrease quantity"
            >
              <Minus className="size-3.5" />
            </button>
            <span className="w-8 text-center text-[12px] font-semibold">
              {pending ? <Loader2 className="mx-auto size-3.5 animate-spin" /> : line.quantity}
            </span>
            <button
              type="button"
              onClick={() => update(line.quantity + 1)}
              disabled={pending || line.quantity >= max}
              className="inline-flex size-8 items-center justify-center rounded-full hover:bg-mist disabled:opacity-40"
              aria-label="Increase quantity"
            >
              <Plus className="size-3.5" />
            </button>
          </div>
          <div className="text-right">
            <Price value={line.line_total} size="sm" />
            <p className="text-[10px] text-muted">{line.stock} in stock</p>
          </div>
        </div>

        {line.quantity >= line.stock ? (
          <p className="mt-1.5 text-[10px] font-medium text-[#9a6500]">
            Maximum available quantity is in your cart.
          </p>
        ) : null}
      </div>
    </li>
  );
}

export function CartLines({ lines }: { lines: CartLine[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function clear() {
    if (pending) return;
    if (!window.confirm("Remove every item from your cart?")) return;
    startTransition(async () => {
      const result = await clearCartAction();
      if (result.ok) {
        toast.success(result.message || "Cart cleared.");
        router.refresh();
      } else {
        toast.error(result.message || "Could not clear the cart.");
      }
    });
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <p className="flex items-center gap-2 text-[13px] font-semibold">
          <ShoppingBag className="size-4 text-violet" /> Cart items
        </p>
        <Button variant="ghost" size="sm" onClick={clear} disabled={pending} className="text-coral hover:bg-coral-soft">
          {pending ? <Loader2 className="animate-spin" /> : <Trash2 />} Clear
        </Button>
      </div>
      <ul className="divide-y divide-line">
        {lines.map((line) => (
          <CartRow key={line.product.id} line={line} />
        ))}
      </ul>
    </div>
  );
}
