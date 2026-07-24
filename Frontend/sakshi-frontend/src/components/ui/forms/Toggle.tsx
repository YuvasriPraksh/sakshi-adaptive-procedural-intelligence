import { cn } from "@/lib/utils";

export interface ToggleProps {
  checked:    boolean;
  onChange:   (v: boolean) => void;
  label?:     string;
  description?: string;
  disabled?:  boolean;
  size?:      "sm" | "md" | "lg";
  id?:        string;
}

const sizeMap = {
  sm: { track: "h-4 w-7",  thumb: "h-3 w-3",  translate: "translate-x-3" },
  md: { track: "h-5 w-9",  thumb: "h-3.5 w-3.5", translate: "translate-x-4" },
  lg: { track: "h-6 w-11", thumb: "h-4 w-4",  translate: "translate-x-5" },
};

export function Toggle({ checked, onChange, label, description, disabled, size = "md", id }: ToggleProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  const s = sizeMap[size];

  return (
    <div className="flex items-center gap-3">
      <button
        role="switch"
        id={inputId}
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex shrink-0 items-center rounded-full border-2 border-transparent",
          "transition-colors duration-200 cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          s.track,
          checked ? "bg-[hsl(var(--primary))]" : "bg-muted",
        )}
      >
        <span
          className={cn(
            "rounded-full bg-white shadow-sm transition-transform duration-200",
            s.thumb,
            checked ? s.translate : "translate-x-0.5",
          )}
        />
      </button>
      {(label || description) && (
        <label htmlFor={inputId} className="cursor-pointer select-none">
          {label && <span className="text-sm font-medium text-foreground">{label}</span>}
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </label>
      )}
    </div>
  );
}
