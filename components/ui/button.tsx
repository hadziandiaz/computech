import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-semibold tracking-tight transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-violet text-white shadow-sm hover:bg-violet-dark hover:shadow-md active:scale-[0.98]",
        neon: "bg-acid text-ink hover:bg-[#cbf02f] active:scale-[0.98]",
        dark: "bg-ink text-white hover:bg-ink-soft active:scale-[0.98]",
        outline:
          "border border-line bg-white text-ink hover:border-violet/40 hover:bg-violet-soft/40",
        soft: "bg-violet-soft text-violet-dark hover:bg-violet/15",
        ghost: "text-ink hover:bg-mist",
        danger: "bg-coral text-white hover:bg-[#e95a65]",
        "danger-ghost": "text-coral hover:bg-coral-soft",
        link: "rounded-none p-0 text-violet underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-9 px-3.5 text-[13px] [&_svg]:size-4",
        md: "h-10 px-5 text-sm [&_svg]:size-[18px]",
        lg: "h-12 px-6 text-[15px] [&_svg]:size-5",
        icon: "size-10 [&_svg]:size-[18px]",
        "icon-sm": "size-8 [&_svg]:size-4",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
