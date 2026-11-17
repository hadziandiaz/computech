import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-violet text-white shadow-[0_8px_24px_-12px_rgba(121,87,255,0.9)] hover:bg-violet-dark active:scale-[0.98]",
        dark: "bg-ink text-white hover:bg-ink-soft active:scale-[0.98]",
        outline:
          "border border-line bg-white text-ink hover:border-ink/30 hover:bg-mist",
        soft: "bg-violet-soft text-violet-dark hover:bg-violet/15",
        ghost: "text-ink hover:bg-line/70",
        danger: "bg-coral text-white hover:bg-[#e95a65]",
        "danger-ghost": "text-coral hover:bg-coral-soft",
        link: "rounded-none p-0 text-violet underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-9 px-4 text-[13px] [&_svg]:size-4",
        md: "h-11 px-5 text-sm [&_svg]:size-[18px]",
        lg: "h-13 px-7 text-[15px] [&_svg]:size-5",
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
