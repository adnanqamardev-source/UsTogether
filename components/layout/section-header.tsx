"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SectionHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  badge?: number;
  icon?: LucideIcon;
  accent?: string;
  action?: React.ReactNode;
}

const SectionHeader = forwardRef<HTMLDivElement, SectionHeaderProps>(
  ({ className, title, badge, icon: Icon, accent = "text-indigo-300", action, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-center justify-between mb-6", className)}
        {...props}
      >
        <h2
          className={cn(
            "text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-2",
            accent
          )}
        >
          {Icon && <Icon className="w-4 h-4" />}
          {title}
          {badge !== undefined && (
            <span className="ml-2 inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white border border-white/10">
              {badge}
            </span>
          )}
        </h2>
        {action && <div>{action}</div>}
      </div>
    );
  }
);
SectionHeader.displayName = "SectionHeader";

export { SectionHeader };
