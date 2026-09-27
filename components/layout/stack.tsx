"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface StackProps extends HTMLAttributes<HTMLDivElement> {
  direction?: "vertical" | "horizontal";
  gap?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between" | "around";
}

const Stack = forwardRef<HTMLDivElement, StackProps>(
  ({ className, direction = "vertical", gap = "md", align, justify, ...props }, ref) => {
    const gaps = {
      none: "gap-0",
      xs: "gap-1",
      sm: "gap-2",
      md: "gap-4",
      lg: "gap-6",
      xl: "gap-8",
    };

    const directions = {
      vertical: "flex-col",
      horizontal: "flex-row",
    };

    const alignments = {
      start: "items-start",
      center: "items-center",
      end: "items-end",
      stretch: "items-stretch",
    };

    const justifications = {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
      between: "justify-between",
      around: "justify-around",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "flex",
          directions[direction],
          gaps[gap],
          align && alignments[align],
          justify && justifications[justify],
          className
        )}
        {...props}
      />
    );
  }
);
Stack.displayName = "Stack";

export { Stack };
