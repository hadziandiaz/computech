"use client";

import { ArrowRight } from "lucide-react";

import { ActionForm, SubmitButton } from "@/components/ui/action-form";
import { subscribeNewsletterAction } from "@/lib/actions/support";

export function NewsletterForm() {
  return (
    <ActionForm action={subscribeNewsletterAction} resetOnSuccess className="mt-3">
      <div className="flex overflow-hidden rounded-lg border border-line bg-white focus-within:border-violet">
        <input
          type="email"
          name="email"
          required
          placeholder="you@example.com"
          aria-label="Email address"
          className="h-10 min-w-0 flex-1 bg-transparent px-3 text-sm text-ink placeholder:text-muted/60 focus:outline-none"
        />
        <SubmitButton
          pendingText="Joining…"
          className="h-10 rounded-none px-3"
          variant="primary"
          size="sm"
        >
          Join <ArrowRight className="size-4" />
        </SubmitButton>
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-muted">
        Product launches, restocks and offers. Unsubscribe any time.
      </p>
    </ActionForm>
  );
}
