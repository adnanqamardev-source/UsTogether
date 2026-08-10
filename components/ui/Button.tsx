"use client";

import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "tertiary" | "magenta" | "icon" | "icon-inverse";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
}

/**
 * Pill-only buttons per DESIGN.md — no square buttons anywhere.
 * - primary: black pill, white text (button-primary)
 * - secondary: white pill, black text (button-secondary)
 * - tertiary: text link hit-target (button-tertiary-text)
 * - magenta: promo CTA (button-magenta-promo) — use once per page
 * - icon / icon-inverse: 40px circular icon buttons (rounded-full)
 */
export function Button({
  variant = "primary",
  fullWidth = false,
  className,
  children,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 font-medium transition-colors disabled:opacity-40 disabled:pointer-events-none select-none cursor-pointer";
  const variants: Record<Variant, string> = {
    // button-primary: black pill, white text, 10px 20px
    primary: "bg-ink text-canvas rounded-pill py-2.5 px-5 hover:bg-ink/85",
    // button-secondary: white pill, black text, 8px 18px 10px
    secondary:
      "bg-canvas text-ink rounded-pill px-[18px] pb-2.5 pt-2 border border-hairline hover:bg-surface-soft",
    // button-tertiary-text: plain text link, rounded-full hit target
    tertiary: "bg-canvas text-ink rounded-full px-3 py-2 hover:bg-surface-soft",
    // button-magenta-promo: saturated pink pill, 10px 18px
    magenta: "bg-accent-magenta text-canvas rounded-pill py-2.5 px-4.5 hover:bg-accent-magenta/85",
    // button-icon-circular: 40px circle, surface-soft bg
    icon: "bg-surface-soft text-ink rounded-full h-10 w-10 hover:bg-hairline",
    // button-icon-circular-inverse: 40px circle, translucent white
    "icon-inverse":
      "bg-on-inverse-soft/15 text-inverse-ink rounded-full h-10 w-10 hover:bg-on-inverse-soft/25",
  };

  return (
    <button
      className={cn(base, variants[variant], fullWidth && "w-full", className)}
      {...props}
    >
      {children}
    </button>
  );
}