import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?:       string;
  description?: string;
  error?:       string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, error, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex items-start gap-3">
        <div className="flex h-5 items-center">
          <input
            ref={ref}
            type="checkbox"
            id={inputId}
            className={cn(
              "h-4 w-4 rounded border-input bg-background accent-[hsl(var(--primary))]",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
              error && "border-danger-500",
              className,
            )}
            {...props}
          />
        </div>
        {(label || description) && (
          <div className="min-w-0">
            {label && (
              <label htmlFor={inputId} className="text-sm font-medium text-foreground cursor-pointer select-none">
                {label}
              </label>
            )}
            {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
            {error && <p className="text-xs text-danger-600 mt-0.5">{error}</p>}
          </div>
        )}
      </div>
    );
  },
);
Checkbox.displayName = "Checkbox";
