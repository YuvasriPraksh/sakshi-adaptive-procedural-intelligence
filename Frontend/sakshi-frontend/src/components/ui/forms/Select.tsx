import { forwardRef, type SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { FieldWrapper } from "./FormField";
import type { SelectOption } from "@/types";

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  label?:       string;
  error?:       string;
  hint?:        string;
  options:      SelectOption[];
  placeholder?: string;
  inputSize?:   "sm" | "md" | "lg";
}

const sizeClasses = { sm: "h-8 text-xs", md: "h-9 text-sm", lg: "h-11 text-base" };

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options, placeholder, inputSize = "md", className, id, required, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <FieldWrapper label={label} htmlFor={inputId} required={required} error={error} hint={hint}>
        <div className="relative">
          <select
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            className={cn(
              "input-base appearance-none pr-9",
              sizeClasses[inputSize],
              error && "border-danger-500 focus-visible:ring-danger-500",
              className,
            )}
            {...props}
          >
            {placeholder && <option value="" disabled>{placeholder}</option>}
            {options.map(opt => (
              <option key={String(opt.value)} value={String(opt.value)} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
      </FieldWrapper>
    );
  },
);
Select.displayName = "Select";
