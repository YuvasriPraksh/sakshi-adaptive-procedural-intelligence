import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { FieldWrapper } from "./FormField";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?:    string;
  error?:    string;
  hint?:     string;
  resize?:   "none" | "y" | "x" | "both";
}

const resizeClass = { none: "resize-none", y: "resize-y", x: "resize-x", both: "resize" };

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, resize = "y", className, id, required, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <FieldWrapper label={label} htmlFor={inputId} required={required} error={error} hint={hint}>
        <textarea
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          className={cn(
            "input-base min-h-[80px] py-2",
            resizeClass[resize],
            error && "border-danger-500 focus-visible:ring-danger-500",
            className,
          )}
          {...props}
        />
      </FieldWrapper>
    );
  },
);
Textarea.displayName = "Textarea";
