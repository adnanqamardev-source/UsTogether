"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-bold uppercase tracking-widest rounded-full transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#bcabae]/70 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary:
          "bg-lilac-ash text-onyx shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]",
        secondary:
          "bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20",
        danger:
          "bg-[#bcabae]/10 border border-[#bcabae]/30 text-[#bcabae] hover:bg-[#bcabae]/20",
        ghost:
          "text-[#bcabae]/70 hover:text-white hover:bg-white/5",
        outline:
          "border border-white/20 text-white hover:bg-white/5 hover:border-white/30",
      },
      size: {
        xs: "px-3 py-1.5 text-[10px]",
        sm: "px-4 py-2 text-xs",
        md: "px-6 py-3 text-sm",
        lg: "px-8 py-4 text-base",
        xl: "px-10 py-5 text-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { buttonVariants };
