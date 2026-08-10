"use client";

import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export type BlockColor =
  | "lime"
  | "lilac"
  | "cream"
  | "pink"
  | "mint"
  | "coral"
  | "navy";

interface ColorBlockProps extends HTMLAttributes<HTMLDivElement> {
  color?: BlockColor;
}

const blockClasses: Record<BlockColor, string> = {
  lime: "bg-block-lime text-ink",
  lilac: "bg-block-lilac text-ink",
  cream: "bg-block-cream text-ink",
  pink: "bg-block-pink text-ink",
  mint: "bg-block-mint text-ink",
  coral: "bg-block-coral text-ink",
  navy: "bg-block-navy text-inverse-ink",
};

/**
 * The signature pastel color-block section from DESIGN.md.
 * Full-content-width rounded panel; the color IS the depth device
 * (no shadows, no gradients). Rounded corners collapse below 768px.
 */
export function ColorBlock({
  color = "lime",
  className,
  children,
  ...props
}: ColorBlockProps) {
  return (
    <section className={cn("color-block", blockClasses[color], className)} {...props}>
      {children}
    </section>
  );
}