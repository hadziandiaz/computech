"use client";

import { ArrowRight } from "lucide-react";

import { ActionForm, SubmitButton } from "@/components/ui/action-form";
import { subscribeNewsletterAction } from "@/lib/actions/support";

export function NewsletterForm() {
  return (
    <ActionForm action={subscribeNewsletterAction} resetOnSuccess className="mt-4">
      <div className="flex overflow-hidden rounded-full border border-white/15 bg-white/5 focus-within:border-neon/60">
        <input
          type="email"
          name="email"
          required
          placeholder="you@example.com"
          aria-label="Email address"
          className="h-11 min-w-0 flex-1 bg-transparent px-4 text-sm text-white placeholder:text-white/35 focus:outline-none"
        />
        <SubmitButton
          pendingText="Joining…"
          className="h-11 rounded-none rounded-r-full px-4"
          variant="primary"
          size="sm"
        >
          Join <ArrowRight className="size-4" />
        </SubmitButton>
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-white/35">
        Product launches, restocks and offers. Unsubscribe any time.
      </p>
    </ActionForm>
  );
}
