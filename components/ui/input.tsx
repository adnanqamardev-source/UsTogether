"use client";

import { forwardRef, useState, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

type InputVariantProps = VariantProps<typeof inputVariants>;

const inputVariants = cva(
  "w-full bg-white/5 border rounded-2xl text-white placeholder:text-[#716969] focus:outline-none focus:ring-2 transition-all duration-200",
  {
    variants: {
      variant: {
        default: "border-white/10 focus:ring-[#bcabae]/50 focus:border-[#bcabae]/50",
        error: "border-[#bcabae]/50 focus:ring-[#bcabae]/30",
        success: "border-green-500/50 focus:ring-green-500/30",
      },
      inputSize: {
        sm: "px-3 py-2 text-xs",
        md: "px-4 py-3 text-sm",
        lg: "px-6 py-4 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      inputSize: "md",
    },
  }
);

type BaseVariantProps = {
  variant?: InputVariantProps["variant"];
  inputSize?: InputVariantProps["inputSize"];
};

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size">,
    BaseVariantProps {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, inputSize, label, error, hint, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-bold uppercase tracking-widest text-[#bcabae] mb-2"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(inputVariants({ variant: error ? "error" : variant, inputSize }), className)}
          {...props}
        />
        {error && (
          <p className="text-xs text-[#bcabae] font-medium mt-2">{error}</p>
        )}
        {hint && !error && (
          <p className="text-xs text-[#716969] mt-2">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement>,
    BaseVariantProps {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, inputSize, label, error, hint, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-bold uppercase tracking-widest text-[#bcabae] mb-2"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(inputVariants({ variant: error ? "error" : variant, inputSize }), "min-h-[120px] resize-y", className)}
          {...props}
        />
        {error && (
          <p className="text-xs text-[#bcabae] font-medium mt-2">{error}</p>
        )}
        {hint && !error && (
          <p className="text-xs text-[#716969] mt-2">{hint}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export { inputVariants };
