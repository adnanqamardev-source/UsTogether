"use client";

import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  /** inverse styling for use on black inverse-canvas surfaces */
  inverse?: boolean;
}

/**
 * UsTogether wordmark. Monochrome per DESIGN.md —
 * black mark + bold "Together" on canvas, or inverted on dark surfaces.
 * No gradients, no shadows.
 */
export function Logo({ className, inverse = false }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2 select-none", className)}>
      <span
        aria-hidden
        className={cn(
          "rounded-md w-6 h-6 flex items-center justify-center text-sm font-bold",
          inverse ? "bg-canvas text-ink" : "bg-ink text-canvas"
        )}
      >
        U
      </span>
      <span
        className={cn(
          "text-lg font-medium tracking-tight",
          inverse ? "text-inverse-ink" : "text-ink"
        )}
      >
        Us<span className="font-bold">Together</span>
      </span>
    </div>
  );
}