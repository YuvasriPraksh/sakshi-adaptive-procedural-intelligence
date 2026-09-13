import { forwardRef, type HTMLAttributes, type LabelHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

// ─── Label ────────────────────────────────────────────────────────────────────
export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}
export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, required, children, ...props }, ref) => (
    <label ref={ref} className={cn("label-base", className)} {...props}>
      {children}
      {required && <span className="ml-0.5 text-danger-500" aria-hidden>*</span>}
    </label>
  ),
);
Label.displayName = "Label";

// ─── FieldWrapper ─────────────────────────────────────────────────────────────
export interface FieldWrapperProps extends HTMLAttributes<HTMLDivElement> {
  label?:     string;
  htmlFor?:   string;
  required?:  boolean;
  error?:     string;
  hint?:      string;
  children:   ReactNode;
}
export function FieldWrapper({ label, htmlFor, required, error, hint, children, className, ...props }: FieldWrapperProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)} {...props}>
      {label && <Label htmlFor={htmlFor} required={required}>{label}</Label>}
      {children}
      {error && <p className="text-xs text-danger-600 dark:text-danger-400">{error}</p>}
      {!error && hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
