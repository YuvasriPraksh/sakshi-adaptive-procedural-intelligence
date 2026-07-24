import { cn } from "@/lib/utils";

export interface SpinnerProps {
  size?:      "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  label?:     string;
}

const sizeMap = { xs: "h-3 w-3", sm: "h-4 w-4", md: "h-6 w-6", lg: "h-8 w-8", xl: "h-12 w-12" };

export function Spinner({ size = "md", className, label = "Loading…" }: SpinnerProps) {
  return (
    <div role="status" aria-label={label} className={cn("inline-flex", className)}>
      <svg
        className={cn("animate-spin text-[hsl(var(--primary))]", sizeMap[size])}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
      </svg>
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function PageSpinner() {
  return (
    <div className="center-page">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-muted-foreground animate-pulse-soft">Loading…</p>
      </div>
    </div>
  );
}
