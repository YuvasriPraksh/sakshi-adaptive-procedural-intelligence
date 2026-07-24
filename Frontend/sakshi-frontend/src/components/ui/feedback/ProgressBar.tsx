import { cn } from "@/lib/utils";

export interface ProgressBarProps {
  value:       number;      // 0–100
  max?:        number;
  label?:      string;
  showValue?:  boolean;
  size?:       "xs" | "sm" | "md" | "lg";
  color?:      "primary" | "success" | "warning" | "danger";
  animate?:    boolean;
  className?:  string;
}

const sizeMap  = { xs: "h-1",   sm: "h-1.5", md: "h-2.5", lg: "h-4"  };
const colorMap = {
  primary: "bg-[hsl(var(--primary))]",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger:  "bg-danger-500",
};

export function ProgressBar({ value, max = 100, label, showValue, size = "md", color = "primary", animate = true, className }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={cn("w-full", className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-1.5">
          {label    && <span className="text-xs font-medium text-muted-foreground">{label}</span>}
          {showValue && <span className="text-xs font-semibold text-foreground">{Math.round(pct)}%</span>}
        </div>
      )}
      <div className={cn("w-full rounded-full bg-muted overflow-hidden", sizeMap[size])} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
        <div
          className={cn("h-full rounded-full transition-all", colorMap[color], animate && "duration-700 ease-out")}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Circular Progress ────────────────────────────────────────────────────────
export interface CircularProgressProps {
  value:       number;
  max?:        number;
  size?:       number;
  strokeWidth?: number;
  color?:      "primary" | "success" | "warning" | "danger";
  showValue?:  boolean;
  label?:      string;
  className?:  string;
}

const circleColorMap = {
  primary: "stroke-[hsl(var(--primary))]",
  success: "stroke-emerald-500",
  warning: "stroke-amber-500",
  danger:  "stroke-danger-500",
};

export function CircularProgress({ value, max = 100, size = 64, strokeWidth = 6, color = "primary", showValue = true, label, className }: CircularProgressProps) {
  const r   = (size - strokeWidth * 2) / 2;
  const circ = 2 * Math.PI * r;
  const pct  = Math.min(100, Math.max(0, (value / max) * 100));
  const dash  = circ - (pct / 100) * circ;

  return (
    <div className={cn("inline-flex flex-col items-center gap-1", className)} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={strokeWidth} className="stroke-muted" />
          <circle
            cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={strokeWidth}
            strokeDasharray={circ} strokeDashoffset={dash}
            strokeLinecap="round"
            className={cn("transition-all duration-700 ease-out", circleColorMap[color])}
          />
        </svg>
        {showValue && (
          <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-foreground">
            {Math.round(pct)}%
          </span>
        )}
      </div>
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
    </div>
  );
}
