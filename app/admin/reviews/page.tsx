import { MessageSquare, Star, Trash2 } from "lucide-react";
import Link from "next/link";

import { AdminHeader } from "@/components/admin/admin-header";
import { InlineButton } from "@/components/ui/action-form";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import {
  deleteReviewAction,
  setReviewApprovalAction,
} from "@/lib/actions/admin/moderation";
import { getAllReviews } from "@/lib/data/reviews";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Reviews",
};

const FILTERS = [
  { key: "pending", label: "Awaiting moderation" },
  { key: "approved", label: "Published" },
  { key: "all", label: "All reviews" },
] as const;

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((step) => (
        <Star
          key={step}
          className={step <= value ? "size-3 fill-[#F5B301] text-[#F5B301]" : "size-3 text-line"}
        />
      ))}
    </span>
  );
}

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filterRaw = single(params.filter);
  const filter = (FILTERS.find((item) => item.key === filterRaw)?.key ?? "pending") as
    | "pending"
    | "approved"
    | "all";

  const reviews = await getAllReviews();
  const filtered = reviews.filter((review) => {
    if (filter === "pending") return !review.is_approved;
    if (filter === "approved") return review.is_approved;
    return true;
  });
  const average =
    reviews.length > 0
      ? Math.round((reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length) * 10) /
        10
      : 0;
  const pending = reviews.filter((review) => !review.is_approved).length;

  return (
    <div>
      <AdminHeader
        eyebrow="Community"
        title="Review moderation"
        description="Only approved reviews are visible on product pages. Verified reviews are linked to a delivered order item."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-line bg-white p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted">
            Published
          </p>
          <p className="mt-1 font-display text-2xl font-bold">{reviews.length - pending}</p>
          <p className="text-[11px] text-muted">Visible on product pages</p>
        </div>
        <div className="rounded-2xl border border-line bg-white p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted">
            Awaiting moderation
          </p>
          <p className="mt-1 font-display text-2xl font-bold">{pending}</p>
          <p className="text-[11px] text-muted">Hidden until approved</p>
        </div>
        <div className="rounded-2xl border border-line bg-white p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted">
            Average rating
          </p>
          <p className="mt-1 font-display text-2xl font-bold">{average.toFixed(1)}</p>
          <p className="text-[11px] text-muted">Across all reviews</p>
        </div>
      </div>

      <section className="mt-6 rounded-2xl border border-line bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-4">
          <div className="flex gap-1">
            {FILTERS.map((item) => (
              <Link
                key={item.key}
                href={item.key === "pending" ? "/admin/reviews" : `/admin/reviews?filter=${item.key}`}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-[11px] font-semibold transition-colors",
                  filter === item.key
                    ? "bg-violet-soft text-violet-dark"
                    : "text-muted hover:bg-mist hover:text-ink",
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <Badge tone="neutral">{filtered.length} shown</Badge>
        </div>

        {filtered.length ? (
          <ul className="divide-y divide-line">
            {filtered.map((review) => (
              <li key={review.id} className="p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Stars value={review.rating} />
                      <Badge tone={review.is_approved ? "success" : "warning"}>
                        {review.is_approved ? "Published" : "Pending"}
                      </Badge>
                      {review.is_demo ? <Badge tone="neutral">Demo</Badge> : null}
                      {review.order_item_id ? <Badge tone="cyan">Verified</Badge> : null}
                    </div>
                    {review.product ? (
                      <Link
                        href={`/products/${review.product.slug}`}
                        target="_blank"
                        className="mt-1 line-clamp-1 text-[13px] font-semibold hover:text-violet-dark"
                      >
                        {review.product.name}
                      </Link>
                    ) : (
                      <p className="mt-1 text-[13px] font-semibold">Deleted product</p>
                    )}
                    <p className="mt-0.5 text-[11px] text-muted">
                      {review.profile?.full_name ?? review.reviewer_name} ·{" "}
                      {formatDateTime(review.created_at)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1">
                    {review.is_approved ? (
                      <InlineButton
                        action={setReviewApprovalAction.bind(null, review.id, false)}
                        variant="outline"
                        size="sm"
                        pendingText="Unpublishing…"
                      >
                        Unpublish
                      </InlineButton>
                    ) : (
                      <InlineButton
                        action={setReviewApprovalAction.bind(null, review.id, true)}
                        variant="primary"
                        size="sm"
                        pendingText="Approving…"
                      >
                        Approve
                      </InlineButton>
                    )}
                    <InlineButton
                      action={deleteReviewAction.bind(null, review.id)}
                      variant="danger-ghost"
                      size="icon-sm"
                      confirm="Delete this review permanently?"
                      pendingText="Deleting…"
                    >
                      <Trash2 />
                    </InlineButton>
                  </div>
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
              icon={<MessageSquare className="size-5" />}
              title={filter === "pending" ? "Nothing to moderate" : "No reviews in this view"}
              description={
                filter === "pending"
                  ? "New customer reviews will appear here for approval before they go public."
                  : "Reviews submitted by customers and demo seed reviews appear here."
              }
            />
          </div>
        )}
      </section>
    </div>
  );
}
