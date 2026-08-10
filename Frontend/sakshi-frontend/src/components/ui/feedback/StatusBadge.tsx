import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export type BadgeVariant = "default" | "primary" | "secondary" | "success" | "warning" | "danger" | "info" | "muted" | "completed" | "current" | "pending" | "blocked" | "critical";
export type BadgeSize    = "xs" | "sm" | "md";

const variantMap: Record<BadgeVariant, string> = {
  default:   "bg-slate-900/60 text-slate-400 border-slate-800/80",
  primary:   "bg-sky-950/60 text-sky-300 border-sky-800/60",
  secondary: "bg-violet-950/60 text-violet-300 border-violet-800/60",
  success:   "bg-emerald-950/60 text-emerald-300 border-emerald-800/60",
  completed: "bg-emerald-950/60 text-emerald-300 border-emerald-800/60",
  current:   "bg-sky-950/60 text-sky-300 border-sky-800/60",
  info:      "bg-sky-950/60 text-sky-300 border-sky-800/60",
  warning:   "bg-amber-950/60 text-amber-300 border-amber-800/60",
  pending:   "bg-amber-950/60 text-amber-300 border-amber-800/60",
  danger:    "bg-rose-950/60 text-rose-300 border-rose-800/60",
  blocked:   "bg-rose-950/60 text-rose-300 border-rose-800/60",
  critical:  "bg-rose-950/60 text-rose-300 border-rose-800/60",
  muted:     "bg-slate-900/40 text-slate-400 border-slate-800/40",
};

const sizeMap: Record<BadgeSize, string> = {
  xs: "text-2xs px-2 py-0.5 gap-1 rounded-md",
  sm: "text-xs  px-2.5 py-0.5 gap-1.5 rounded-md",
  md: "text-xs  px-3 py-1 gap-1.5 rounded-md",
};

export interface StatusBadgeProps {
  variant?:  BadgeVariant;
  size?:     BadgeSize;
  dot?:      boolean;
  icon?:     ReactNode;
  children:  ReactNode;
  className?: string;
}

export function StatusBadge({ variant = "default", size = "sm", dot, icon, children, className }: StatusBadgeProps) {
  return (
    <span className={cn(
      "badge-base border font-medium tracking-tight",
      variantMap[variant],
      sizeMap[size],
      className,
    )}>
      {dot && <span className={cn("status-dot", {
        "bg-emerald-400": variant === "success" || variant === "completed",
        "bg-amber-400":   variant === "warning" || variant === "pending",
        "bg-rose-400":    variant === "danger" || variant === "blocked" || variant === "critical",
        "bg-sky-400":     variant === "info" || variant === "primary" || variant === "current",
        "bg-violet-400":  variant === "secondary",
        "bg-slate-400":   variant === "default" || variant === "muted",
      })} />}
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
