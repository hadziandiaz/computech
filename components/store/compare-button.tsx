"use client";

import { GitCompareArrows } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

export const COMPARE_STORAGE_KEY = "ct_compare_ids";
export const COMPARE_EVENT = "ct:compare-change";
const MAX_COMPARE = 4;

export function readCompareIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(COMPARE_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string").slice(0, MAX_COMPARE)
      : [];
  } catch {
    return [];
  }
}

export function writeCompareIds(ids: string[]) {
  window.localStorage.setItem(COMPARE_STORAGE_KEY, JSON.stringify(ids.slice(0, MAX_COMPARE)));
  window.dispatchEvent(new CustomEvent(COMPARE_EVENT, { detail: ids }));
}

export function CompareButton({
  productId,
  className,
  withLabel = false,
}: {
  productId: string;
  className?: string;
  withLabel?: boolean;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState(false);

  useEffect(() => {
    const sync = () => setSelected(readCompareIds().includes(productId));
    sync();
    window.addEventListener(COMPARE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(COMPARE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [productId]);

  function toggle() {
    const ids = readCompareIds();
    if (ids.includes(productId)) {
      writeCompareIds(ids.filter((id) => id !== productId));
      setSelected(false);
      toast.success("Removed from comparison.");
      return;
    }
    if (ids.length >= MAX_COMPARE) {
      toast.error(`You can compare up to ${MAX_COMPARE} products at once.`);
      return;
    }
    writeCompareIds([...ids, productId]);
    setSelected(true);
    toast.success("Added to comparison. Open Compare to review specs.");
    router.push("/compare");
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={selected}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-full border border-line bg-white/95 text-ink shadow-sm transition-colors hover:border-violet/40 hover:text-violet",
        selected && "border-violet/40 bg-violet-soft text-violet-dark",
        withLabel && "w-auto gap-2 px-4 text-[13px] font-semibold",
        className,
      )}
      title={selected ? "Remove from compare" : "Add to compare"}
    >
      <GitCompareArrows className="size-4" />
      {withLabel ? <span>{selected ? "In compare" : "Compare"}</span> : null}
    </button>
  );
}
