"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border",
  {
    variants: {
      variant: {
        default: "bg-white/5 border-white/10 text-[#bcabae]",
        primary: "bg-[#bcabae]/10 border-[#bcabae]/30 text-[#bcabae]",
        secondary: "bg-white/5 border-white/10 text-white",
        success: "bg-green-500/10 border-green-500/30 text-green-400",
        warning: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
        danger: "bg-red-500/10 border-red-500/30 text-red-400",
        outline: "border-white/20 text-white",
      },
      size: {
        sm: "px-2 py-0.5 text-[10px]",
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

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";

export { badgeVariants };
