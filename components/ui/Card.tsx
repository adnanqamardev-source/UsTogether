"use client";

import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** rounded-md tile (template-card) vs rounded-lg panel (pricing-card) */
  size?: "md" | "lg";
}

/**
 * Hairline-bordered canvas surfaces per DESIGN.md.
 * - lg: rounded-lg (24px), padding 24px — pricing-card
 * - md: rounded-md (8px), padding 16px — template-card / feature tile
 * Depth is communicated with borders, not shadows.
 */
export function Card({ size = "lg", className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-canvas text-ink border border-hairline",
        size === "lg" ? "rounded-lg p-6" : "rounded-md p-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}