"use client";

import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-10 border border-white/10 rounded-3xl bg-white/5",
        className
      )}
    >
      <div className="w-14 h-14 rounded-full border border-dashed border-white/20 flex items-center justify-center text-xl mb-4">
        <Icon className="w-6 h-6 text-[#bcabae]" />
      </div>
      <h3 className="text-lg font-serif italic text-white mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-[#bcabae]/60 mb-6 max-w-md w-full">{description}</p>
      )}
      {action && (
        <Button variant="secondary" size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
