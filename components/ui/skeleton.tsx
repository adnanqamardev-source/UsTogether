"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {}

const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("animate-pulse rounded-2xl bg-white/5", className)}
      {...props}
    />
  )
);
Skeleton.displayName = "Skeleton";

function SkeletonText({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <Skeleton className={cn("h-4", className)} {...props} />;
}

function SkeletonCircle({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <Skeleton className={cn("rounded-full", className)} {...props} />;
}

function SkeletonCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-[2rem] border border-white/10 bg-white/5 p-6", className)}
      {...props}
    >
      <Skeleton className="h-6 w-3/4 mb-4" />
      <Skeleton className="h-4 w-1/2 mb-6" />
      <div className="space-y-3">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}

export { Skeleton, SkeletonText, SkeletonCircle, SkeletonCard };
