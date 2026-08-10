"use client";

import { cn } from "@/lib/utils";
import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

const inputBase =
  "w-full bg-canvas text-ink rounded-md px-3.5 py-3 border border-hairline placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-ink transition-shadow disabled:opacity-50";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
}

/**
 * text-input / text-input-focused tokens from DESIGN.md.
 * Rounded-md (8px), canvas surface, hairline border.
 * Focus is communicated via a ring, not a fill change.
 */
export function Input({ label, hint, className, id, ...props }: InputProps) {
  const inputId = id || props.name;
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={inputId} className="eyebrow text-[13px]">
          {label}
        </label>
      )}
      <input id={inputId} className={cn(inputBase, className)} {...props} />
      {hint && <p className="text-sm text-ink/60">{hint}</p>}
    </div>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function Textarea({ label, className, id, ...props }: TextareaProps) {
  const textareaId = id || props.name;
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={textareaId} className="eyebrow text-[13px]">
          {label}
        </label>
      )}
      <textarea id={textareaId} className={cn(inputBase, "resize-none", className)} {...props} />
    </div>
  );
}