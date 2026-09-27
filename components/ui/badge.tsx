"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full font-bold uppercase tracking-widest border transition-colors",
  {
    variants: {
      variant: {
        default: "bg-white/5 border-white/10 text-slate-300",
        primary: "bg-rose-500/10 border-rose-500/30 text-rose-400",
        secondary: "bg-indigo-500/10 border-indigo-500/30 text-indigo-300",
        success: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
        warning: "bg-amber-500/10 border-amber-500/30 text-amber-400",
        outline: "border-white/20 text-white",
      },
      size: {
        sm: "px-2.5 py-0.5 text-[10px]",
        md: "px-3 py-1 text-xs",
        lg: "px-4 py-1.5 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  )
);
Badge.displayName = "Badge";

export { Badge, badgeVariants };
