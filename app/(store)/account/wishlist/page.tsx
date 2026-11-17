import { ArrowRight, Heart, ShoppingBag } from "lucide-react";
import Link from "next/link";

import { ProductGrid } from "@/components/store/product-grid";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getAuthUser } from "@/lib/auth";
import { getWishlistProducts } from "@/lib/data/wishlist";
import { formatIDR } from "@/lib/format";
import { productUnitPrice } from "@/lib/pricing";

export const metadata = {
  title: "Wishlist",
};

export default async function AccountWishlistPage() {
  const user = await getAuthUser();
  if (!user) return null;

  const products = await getWishlistProducts(user.id);
  const total = products.reduce(
    (sum, product) => sum + (product.effective_price ?? productUnitPrice(product)),
    0,
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-coral">Saved</p>
          <h1 className="mt-1 flex items-center gap-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
            <Heart className="size-6 text-coral" /> Wishlist
          </h1>
          <p className="mt-1 text-sm text-muted">
            {products.length
              ? `${products.length} saved product${products.length === 1 ? "" : "s"} · ${formatIDR(total)} total`
              : "Save products while you browse and compare them here."}
          </p>
        </div>
        <Link href="/products" className={buttonVariants({ variant: "outline", size: "sm" })}>
          <ShoppingBag /> Find more products
        </Link>
      </header>

      {products.length ? (
        <ProductGrid products={products} savedIds={products.map((product) => product.id)} />
      ) : (
        <EmptyState
          icon={<Heart className="size-5" />}
          title="Nothing saved yet"
          description="Tap the heart on any product to keep it here. Your wishlist stays with your account across devices."
          action={
            <Link href="/products" className={buttonVariants({ size: "sm" })}>
              Browse the catalog <ArrowRight />
            </Link>
          }
        />
      )}
    </div>
  );
}
