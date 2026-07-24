import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon?:        ReactNode;
  title:        string;
  description?: string;
  action?:      ReactNode;
  className?:   string;
  size?:        "sm" | "md" | "lg";
}

const sizeMap = {
  sm: { wrap: "py-8",  iconWrap: "h-10 w-10", title: "text-sm", desc: "text-xs" },
  md: { wrap: "py-12", iconWrap: "h-14 w-14", title: "text-base", desc: "text-sm" },
  lg: { wrap: "py-20", iconWrap: "h-20 w-20", title: "text-xl",  desc: "text-base" },
};

export function EmptyState({ icon, title, description, action, className, size = "md" }: EmptyStateProps) {
  const s = sizeMap[size];
  return (
    <div className={cn("flex flex-col items-center justify-center text-center gap-3", s.wrap, className)}>
      {icon && (
        <div className={cn("flex items-center justify-center rounded-full bg-muted text-muted-foreground", s.iconWrap)}>
          {icon}
        </div>
      )}
      <div className="space-y-1 max-w-xs">
        <p className={cn("font-semibold text-foreground", s.title)}>{title}</p>
        {description && <p className={cn("text-muted-foreground", s.desc)}>{description}</p>}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export interface ErrorStateProps {
  title?:       string;
  description?: string;
  action?:      ReactNode;
  className?:   string;
}

export function ErrorState({ title = "Something went wrong", description, action, className }: ErrorStateProps) {
  return (
    <EmptyState
      icon={<span className="text-2xl">⚠️</span>}
      title={title}
      description={description ?? "An unexpected error occurred. Please try again."}
      action={action}
      className={className}
    />
  );
}
