import { cn } from "@/lib/utils";

export interface SkeletonProps {
  className?: string;
  rounded?:   "sm" | "md" | "lg" | "full";
}

const roundedMap = { sm: "rounded-sm", md: "rounded-md", lg: "rounded-xl", full: "rounded-full" };

export function Skeleton({ className, rounded = "md" }: SkeletonProps) {
  return (
    <div
      className={cn("shimmer", roundedMap[rounded], className)}
      role="presentation"
      aria-hidden
    />
  );
}

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn("h-3.5", i === lines - 1 ? "w-2/3" : "w-full")} />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-5 space-y-4", className)}>
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10" rounded="full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <SkeletonText lines={3} />
      <Skeleton className="h-8 w-24" rounded="md" />
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="border-b border-border bg-muted/40 px-4 py-3 grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: cols }).map((_, i) => <Skeleton key={i} className="h-3.5" />)}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="border-b border-border last:border-0 px-4 py-3 grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array.from({ length: cols }).map((_, c) => {
            const w = `${60 + ((r * cols + c) % 4) * 10}%`;
            return <div key={c} className="h-4 shimmer rounded" style={{ width: w }} />;
          })}
        </div>
      ))}
    </div>
  );
}
