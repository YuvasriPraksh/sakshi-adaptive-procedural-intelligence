import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import type { SelectOption } from "@/types";

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?:       string;
  description?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, description, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex items-start gap-3">
        <div className="flex h-5 items-center">
          <input
            ref={ref}
            type="radio"
            id={inputId}
            className={cn(
              "h-4 w-4 border-input bg-background accent-[hsl(var(--primary))]",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
              className,
            )}
            {...props}
          />
        </div>
        {(label || description) && (
          <div>
            {label && <label htmlFor={inputId} className="text-sm font-medium text-foreground cursor-pointer select-none">{label}</label>}
            {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
          </div>
        )}
      </div>
    );
  },
);
Radio.displayName = "Radio";

// ─── RadioGroup ───────────────────────────────────────────────────────────────
export interface RadioGroupProps {
  name:      string;
  label?:    string;
  options:   SelectOption[];
  value?:    string;
  onChange?: (value: string) => void;
  error?:    string;
  orientation?: "horizontal" | "vertical";
}

export function RadioGroup({ name, label, options, value, onChange, error, orientation = "vertical" }: RadioGroupProps) {
  return (
    <fieldset className="flex flex-col gap-1.5">
      {label && <legend className="label-base mb-1">{label}</legend>}
      <div className={cn("flex gap-3", orientation === "horizontal" ? "flex-row flex-wrap" : "flex-col")}>
        {options.map(opt => (
          <Radio
            key={String(opt.value)}
            name={name}
            id={`${name}-${opt.value}`}
            value={String(opt.value)}
            label={opt.label}
            checked={value === String(opt.value)}
            onChange={() => onChange?.(String(opt.value))}
            disabled={opt.disabled}
          />
        ))}
      </div>
      {error && <p className="text-xs text-danger-600">{error}</p>}
    </fieldset>
  );
}
