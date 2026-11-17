import { MessageSquarePlus, Package, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { ProductReviewForm } from "@/components/store/product-review-form";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { submitReviewAction } from "@/lib/actions/orders";
import { getAuthUser } from "@/lib/auth";
import { getReviewableItems, getUserReviews } from "@/lib/data/reviews";
import { formatDate } from "@/lib/format";

export const metadata = {
  title: "My reviews",
};

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((step) => (
        <Star
          key={step}
          className={
            step <= value ? "size-3.5 fill-[#F5B301] text-[#F5B301]" : "size-3.5 text-line"
          }
        />
      ))}
    </span>
  );
}

export default async function AccountReviewsPage() {
  const user = await getAuthUser();
  if (!user) return null;

  const [reviews, reviewable] = await Promise.all([
    getUserReviews(user.id),
    getReviewableItems(user.id),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <p className="eyebrow text-violet">Feedback</p>
        <h1 className="mt-1 flex items-center gap-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">
          <Star className="size-6 text-[#F5B301]" /> My reviews
        </h1>
        <p className="mt-1 text-sm text-muted">
          Reviews are linked to delivered orders and published after moderation.
        </p>
      </header>

      {reviewable.length ? (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <MessageSquarePlus className="size-4 text-violet" />
            <h2 className="font-display text-base font-semibold">Waiting for your review</h2>
          </div>
          <div className="space-y-3">
            {reviewable.map((item) => (
              <article key={item.order_item_id} className="rounded-2xl border border-line bg-white p-4">
                <div className="flex items-center gap-3">
                  <span className="relative size-12 shrink-0 overflow-hidden rounded-xl border border-line bg-mist">
                    {item.image_url ? (
                      <Image
                        src={item.image_url}
                        alt={item.product_name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center text-muted">
                        <Package className="size-4" />
                      </span>
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    {item.product_slug ? (
                      <Link
                        href={`/products/${item.product_slug}`}
                        className="line-clamp-1 text-[13px] font-semibold hover:text-violet-dark"
                      >
                        {item.product_name}
                      </Link>
                    ) : (
                      <p className="line-clamp-1 text-[13px] font-semibold">{item.product_name}</p>
                    )}
                    <p className="text-[11px] text-muted">Order {item.order_number}</p>
                  </div>
                </div>
                <details className="mt-3 rounded-xl border border-line bg-mist/40 p-3">
                  <summary className="cursor-pointer text-[12px] font-semibold text-violet">
                    Write a review
                  </summary>
                  <div className="mt-3">
                    <ProductReviewForm
                      productId={item.product_id}
                      orderItemId={item.order_item_id}
                      action={submitReviewAction}
                    />
                  </div>
                </details>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <Card>
        <div className="border-b border-line px-5 py-4">
          <h2 className="font-display text-base font-semibold">Your submitted reviews</h2>
          <p className="text-xs text-muted">Approved reviews appear on the product page.</p>
        </div>
        {reviews.length ? (
          <ul className="divide-y divide-line">
            {reviews.map((review) => (
              <li key={review.id} className="px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    {review.product ? (
                      <Link
                        href={`/products/${review.product.slug}`}
                        className="text-[13px] font-semibold hover:text-violet-dark"
                      >
                        {review.product.name}
                      </Link>
                    ) : (
                      <p className="text-[13px] font-semibold">Product review</p>
                    )}
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <Stars value={review.rating} />
                      <span className="text-[11px] text-muted">{formatDate(review.created_at)}</span>
                    </div>
                  </div>
                  <Badge tone={review.is_approved ? "success" : "warning"}>
                    {review.is_approved ? "Published" : "Awaiting moderation"}
                  </Badge>
                </div>
                {review.title ? (
                  <p className="mt-2 text-[13px] font-semibold">{review.title}</p>
                ) : null}
                <p className="mt-1 text-[12px] leading-relaxed text-muted">{review.body}</p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-5">
            <EmptyState
              icon={<Star className="size-5" />}
              title="No reviews yet"
              description="After an order is delivered, you can review each item from this page or from the order detail."
              action={
                <Link href="/account/orders" className={buttonVariants({ variant: "outline", size: "sm" })}>
                  View orders
                </Link>
              }
            />
          </div>
        )}
      </Card>
    </div>
  );
}
