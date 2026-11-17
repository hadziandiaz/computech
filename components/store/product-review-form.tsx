"use client";

import { Star } from "lucide-react";

import { ActionForm, SubmitButton, useFieldError } from "@/components/ui/action-form";
import { Input, Textarea } from "@/components/ui/input";
import type { ActionResult } from "@/lib/actions/types";

function FieldMessage({ name }: { name: string }) {
  const error = useFieldError(name);
  return error ? <p className="mt-1 text-xs font-medium text-coral">{error}</p> : null;
}

function RatingInput({ name }: { name: string }) {
  const error = useFieldError(name);
  return (
    <div>
      <div className="flex flex-wrap items-center gap-1.5">
        {[5, 4, 3, 2, 1].map((value) => (
          <label
            key={value}
            className="group inline-flex cursor-pointer items-center gap-1 rounded-full border border-line bg-white px-3 py-1.5 text-xs font-semibold text-muted transition-colors has-[:checked]:border-violet has-[:checked]:bg-violet-soft has-[:checked]:text-violet-dark"
          >
            <input type="radio" name={name} value={value} className="sr-only" required />
            <Star className="size-3.5 fill-[#F5B301] text-[#F5B301]" />
            {value}
          </label>
        ))}
      </div>
      {error ? <p className="mt-1 text-xs font-medium text-coral">{error}</p> : null}
    </div>
  );
}

export function ProductReviewForm({
  productId,
  orderItemId,
  action,
}: {
  productId: string;
  orderItemId?: string;
  action: (formData: FormData) => Promise<ActionResult>;
}) {
  return (
    <ActionForm action={action} resetOnSuccess className="space-y-3">
      <input type="hidden" name="product_id" value={productId} />
      {orderItemId ? <input type="hidden" name="order_item_id" value={orderItemId} /> : null}
      <div>
        <p className="mb-1.5 text-[13px] font-semibold">Your rating</p>
        <RatingInput name="rating" />
      </div>
      <div>
        <label htmlFor="review-title" className="mb-1.5 block text-[13px] font-semibold">
          Headline <span className="font-normal text-muted">(optional)</span>
        </label>
        <Input id="review-title" name="title" maxLength={120} placeholder="Sums up your experience" />
        <FieldMessage name="title" />
      </div>
      <div>
        <label htmlFor="review-body" className="mb-1.5 block text-[13px] font-semibold">
          Review
        </label>
        <Textarea
          id="review-body"
          name="body"
          required
          minLength={10}
          maxLength={2000}
          placeholder="How does it perform in your setup? Mention installation, thermals or anything buyers should know."
        />
        <FieldMessage name="body" />
      </div>
      <SubmitButton size="sm" pendingText="Submitting…">
        Submit for moderation
      </SubmitButton>
      <p className="text-[11px] text-muted">
        Reviews are published after a moderator approves them.
      </p>
    </ActionForm>
  );
}
