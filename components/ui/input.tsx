"use client";

import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const inputVariants = cva(
  "w-full bg-white/5 border rounded-2xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 transition-all duration-200",
  {
    variants: {
      variant: {
        default: "border-white/10 focus:ring-rose-500/50 focus:border-rose-500/50",
        error: "border-rose-500/50 focus:ring-rose-500/30 focus:border-rose-500",
        success: "border-emerald-500/50 focus:ring-emerald-500/30 focus:border-emerald-500",
      },
      size: {
        sm: "px-3 py-2 text-sm",
        md: "px-4 py-3 text-base",
        lg: "px-6 py-4 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size, label, error, hint, id, ...props }, ref) => {
    const inputId = id || props.name || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-bold uppercase tracking-widest text-indigo-300"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(inputVariants({ variant, size }), className)}
          {...props}
        />
        {error && (
          <p className="text-xs text-rose-400 font-medium">{error}</p>
        )}
        {hint && !error && (
          <p className="text-xs text-slate-500">{hint}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  hint?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, size, label, error, hint, id, ...props }, ref) => {
    const inputId = id || props.name || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-bold uppercase tracking-widest text-indigo-300"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(inputVariants({ variant, size }), "resize-none", className)}
          {...props}
        />
        {error && (
          <p className="text-xs text-rose-400 font-medium">{error}</p>
        )}
        {hint && !error && (
          <p className="text-xs text-slate-500">{hint}</p>
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export { Input, Textarea, inputVariants };
