"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-bold uppercase tracking-widest rounded-full transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500/70 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-r from-rose-500 to-indigo-600 text-white shadow-lg shadow-rose-500/20 hover:shadow-xl hover:shadow-rose-500/30 hover:scale-[1.02] active:scale-[0.98]",
        secondary:
          "bg-white/5 border border-white/10 text-slate-200 hover:bg-white/10 hover:border-white/20 hover:text-white",
        destructive:
          "bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 hover:border-rose-500/50 hover:text-rose-300",
        ghost:
          "text-slate-300 hover:text-white hover:bg-white/5",
        outline:
          "border border-white/20 text-white hover:bg-white/5 hover:border-white/30",
      },
      size: {
        sm: "px-4 py-2 text-xs",
        md: "px-6 py-3 text-sm",
        lg: "px-8 py-4 text-base",
        icon: "p-2.5",
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

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  )
);

Button.displayName = "Button";

export { Button, buttonVariants };
