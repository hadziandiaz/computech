"use client";

import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { toggleWishlistAction } from "@/lib/actions/wishlist";
import { cn } from "@/lib/utils";

export function WishlistButton({
  productId,
  initialSaved = false,
  className,
  withLabel = false,
}: {
  productId: string;
  initialSaved?: boolean;
  className?: string;
  withLabel?: boolean;
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [pending, startTransition] = useTransition();

  function toggle() {
    if (pending) return;
    startTransition(async () => {
      const result = await toggleWishlistAction(productId);
      if (result.ok) {
        const added = Boolean((result.data as { added?: boolean } | undefined)?.added);
        setSaved(added);
        toast.success(result.message || (added ? "Saved." : "Removed."));
        router.refresh();
      } else if (result.code === "auth") {
        toast.error(result.message || "Sign in to save products.");
        router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      } else {
        toast.error(result.message || "Could not update your wishlist.");
      }
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
      aria-pressed={saved}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-full border border-line bg-white/95 text-ink shadow-sm transition-colors hover:border-coral/40 hover:text-coral disabled:opacity-60",
        saved && "border-coral/40 text-coral",
        withLabel && "w-auto gap-2 px-4 text-[13px] font-semibold",
        className,
      )}
    >
      <Heart className={cn("size-4", saved && "fill-coral")} />
      {withLabel ? <span>{saved ? "Saved" : "Save"}</span> : null}
    </button>
  );
}
