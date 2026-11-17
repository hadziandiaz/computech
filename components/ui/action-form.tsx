"use client";

import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type FormHTMLAttributes,
  type ReactNode,
} from "react";
import { useFormStatus } from "react-dom";
import { useActionState } from "react";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import type { ActionResult } from "@/lib/actions/types";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";

type ServerFormAction = (formData: FormData) => Promise<ActionResult>;

const FieldErrorContext = createContext<Record<string, string[]> | undefined>(undefined);

export function useFieldError(name: string) {
  const errors = useContext(FieldErrorContext);
  return errors?.[name]?.[0];
}

export function ActionForm({
  action,
  children,
  className,
  resetOnSuccess = false,
  showMessage = true,
  ...rest
}: Omit<FormHTMLAttributes<HTMLFormElement>, "action"> & {
  action: ServerFormAction;
  children: ReactNode;
  resetOnSuccess?: boolean;
  showMessage?: boolean;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const seen = useRef<ActionResult | null>(null);
  const [state, formAction] = useActionState<ActionResult | null, FormData>(
    async (_previous, formData) => action(formData),
    null,
  );

  useEffect(() => {
    if (!state || seen.current === state) return;
    seen.current = state;

    if (state.ok) {
      if (state.message) toast.success(state.message);
      if (resetOnSuccess) formRef.current?.reset();
      if (state.redirectTo) {
        router.push(state.redirectTo);
      } else {
        router.refresh();
      }
    } else if (state.code === "auth") {
      toast.error(state.message || "Please sign in to continue.");
      router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
    } else {
      toast.error(state.message || "Something went wrong.");
    }
  }, [state, resetOnSuccess, router]);

  return (
    <FieldErrorContext.Provider value={state?.fieldErrors}>
      <form ref={formRef} action={formAction} className={className} {...rest}>
        {showMessage && state && !state.ok && !state.fieldErrors ? (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-coral/30 bg-coral-soft px-3 py-2.5 text-sm text-[#b23b46]">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{state.message}</span>
          </div>
        ) : null}
        {showMessage && state?.ok && state.message && !state.redirectTo ? (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-[#b8ebc9] bg-[#e9f9ef] px-3 py-2.5 text-sm text-[#18794e]">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
            <span>{state.message}</span>
          </div>
        ) : null}
        {children}
      </form>
    </FieldErrorContext.Provider>
  );
}

export function SubmitButton({
  children,
  pendingText = "Saving…",
  className,
  variant,
  size,
  disabled,
}: {
  children: ReactNode;
  pendingText?: string;
  className?: string;
  variant?: VariantProps<typeof buttonVariants>["variant"];
  size?: VariantProps<typeof buttonVariants>["size"];
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant={variant}
      size={size}
      className={className}
      disabled={pending || disabled}
      aria-busy={pending}
    >
      {pending ? <Loader2 className="animate-spin" /> : null}
      {pending ? pendingText : children}
    </Button>
  );
}

export function InlineButton({
  action,
  children,
  className,
  variant = "ghost",
  size = "sm",
  confirm,
  pendingText,
}: {
  action: () => Promise<ActionResult>;
  children: ReactNode;
  className?: string;
  variant?: VariantProps<typeof buttonVariants>["variant"];
  size?: VariantProps<typeof buttonVariants>["size"];
  confirm?: string;
  pendingText?: string;
}) {
  const router = useRouter();
  const pendingRef = useRef(false);

  async function run() {
    if (pendingRef.current) return;
    if (confirm && !window.confirm(confirm)) return;
    pendingRef.current = true;
    const result = await action();
    pendingRef.current = false;
    if (result.ok) {
      toast.success(result.message || "Done.");
      if (result.redirectTo) router.push(result.redirectTo);
      else router.refresh();
    } else {
      toast.error(result.message || "Something went wrong.");
    }
  }

  return (
    <button
      type="button"
      onClick={run}
      className={cn(buttonVariants({ variant, size }), className)}
    >
      {children}
      {pendingText ? <span className="sr-only">{pendingText}</span> : null}
    </button>
  );
}
