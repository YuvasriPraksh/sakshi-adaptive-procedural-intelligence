import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export type BadgeVariant = "default" | "primary" | "secondary" | "success" | "warning" | "danger" | "info" | "muted";
export type BadgeSize    = "xs" | "sm" | "md";

const variantMap: Record<BadgeVariant, string> = {
  default:   "bg-muted text-muted-foreground border-border",
  primary:   "bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] border-[hsl(var(--primary))]/20",
  secondary: "bg-royal-100 text-royal-700 border-royal-200 dark:bg-royal-950/30 dark:text-royal-300 dark:border-royal-800",
  success:   "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800",
  warning:   "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800",
  danger:    "bg-danger-50 text-danger-700 border-danger-200 dark:bg-danger-950/30 dark:text-danger-400 dark:border-danger-800",
  info:      "bg-royal-50 text-royal-700 border-royal-200 dark:bg-royal-950/30 dark:text-royal-300 dark:border-royal-800",
  muted:     "bg-muted/60 text-muted-foreground border-transparent",
};

const sizeMap: Record<BadgeSize, string> = {
  xs: "text-2xs px-1.5 py-0.5 gap-0.5",
  sm: "text-xs  px-2   py-0.5 gap-1",
  md: "text-xs  px-2.5 py-1   gap-1",
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
      "badge-base border font-medium",
      variantMap[variant],
      sizeMap[size],
      className,
    )}>
      {dot && <span className={cn("status-dot", {
        "bg-emerald-500": variant === "success",
        "bg-amber-500":   variant === "warning",
        "bg-danger-500":  variant === "danger",
        "bg-royal-500":   variant === "info" || variant === "secondary",
        "bg-[hsl(var(--primary))]": variant === "primary",
        "bg-muted-foreground":      variant === "default" || variant === "muted",
      })} />}
      {icon && <span>{icon}</span>}
      {children}
    </span>
  );
}
