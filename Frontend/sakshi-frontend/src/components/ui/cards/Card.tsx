import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// ─── Base card ────────────────────────────────────────────────────────────────
const cardVariants = cva(
  "rounded-xl bg-card text-card-foreground border border-border transition-shadow",
  {
    variants: {
      shadow:    { none: "", sm: "shadow-sm", md: "shadow-md", lg: "shadow-lg" },
      hoverable: { true: "hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer" },
      padding:   { none: "", sm: "p-3", md: "p-5", lg: "p-6 md:p-8" },
    },
    defaultVariants: { shadow: "sm", padding: "md" },
  },
);

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, shadow, hoverable, padding, ...props }, ref) => (
    <div ref={ref} className={cn(cardVariants({ shadow, hoverable, padding }), className)} {...props} />
  ),
);
Card.displayName = "Card";

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col gap-1.5 pb-4", className)} {...props} />
  ),
);
CardHeader.displayName = "CardHeader";

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-base font-semibold text-foreground leading-tight", className)} {...props} />
  ),
);
CardTitle.displayName = "CardTitle";

export const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  ),
);
CardDescription.displayName = "CardDescription";

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("", className)} {...props} />
  ),
);
CardContent.displayName = "CardContent";

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center pt-4 border-t border-border mt-4", className)} {...props} />
  ),
);
CardFooter.displayName = "CardFooter";

// ─── Statistics Card ──────────────────────────────────────────────────────────
export interface StatCardProps extends HTMLAttributes<HTMLDivElement> {
  title:       string;
  value:       string | number;
  subtitle?:   string;
  icon?:       ReactNode;
  trend?:      { value: number; label?: string };
  colorAccent?: "primary" | "success" | "warning" | "danger";
}

const accentMap = {
  primary: "text-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10",
  success: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30",
  warning: "text-amber-600 bg-amber-50 dark:bg-amber-950/30",
  danger:  "text-danger-600 bg-danger-50 dark:bg-danger-950/30",
};

export function StatCard({ title, value, subtitle, icon, trend, colorAccent = "primary", className, ...props }: StatCardProps) {
  const trendPositive = trend && trend.value >= 0;
  return (
    <Card className={cn("", className)} {...props}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider truncate">{title}</p>
          <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
          {subtitle && <p className="mt-0.5 text-xs text-muted-foreground truncate">{subtitle}</p>}
          {trend && (
            <div className={cn("mt-2 inline-flex items-center gap-1 text-xs font-medium rounded-full px-2 py-0.5",
              trendPositive ? "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/40"
                            : "text-danger-700 bg-danger-50 dark:text-danger-400 dark:bg-danger-950/40",
            )}>
              <span>{trendPositive ? "▲" : "▼"}</span>
              <span>{Math.abs(trend.value)}%</span>
              {trend.label && <span className="text-muted-foreground">{trend.label}</span>}
            </div>
          )}
        </div>
        {icon && (
          <div className={cn("flex-shrink-0 rounded-xl p-2.5", accentMap[colorAccent])}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}

// ─── Alert Card ───────────────────────────────────────────────────────────────
export type AlertCardVariant = "info" | "success" | "warning" | "danger";

const alertStyles: Record<AlertCardVariant, string> = {
  info:    "border-royal-200 bg-royal-50 dark:bg-royal-950/20 dark:border-royal-800",
  success: "border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-800",
  warning: "border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800",
  danger:  "border-danger-200 bg-danger-50 dark:bg-danger-950/20 dark:border-danger-800",
};

const alertTitleStyles: Record<AlertCardVariant, string> = {
  info:    "text-royal-800 dark:text-royal-300",
  success: "text-emerald-800 dark:text-emerald-300",
  warning: "text-amber-800 dark:text-amber-300",
  danger:  "text-danger-800 dark:text-danger-300",
};

export interface AlertCardProps extends HTMLAttributes<HTMLDivElement> {
  variant:   AlertCardVariant;
  title:     string;
  message?:  string;
  icon?:     ReactNode;
  actions?:  ReactNode;
}

export function AlertCard({ variant, title, message, icon, actions, className, ...props }: AlertCardProps) {
  return (
    <div
      role="alert"
      className={cn("rounded-xl border p-4", alertStyles[variant], className)}
      {...props}
    >
      <div className="flex items-start gap-3">
        {icon && <span className="mt-0.5 shrink-0">{icon}</span>}
        <div className="flex-1 min-w-0">
          <p className={cn("text-sm font-semibold", alertTitleStyles[variant])}>{title}</p>
          {message && <p className="mt-1 text-sm text-muted-foreground">{message}</p>}
          {actions && <div className="mt-3 flex items-center gap-2">{actions}</div>}
        </div>
      </div>
    </div>
  );
}

// ─── Notification Card ────────────────────────────────────────────────────────
export interface NotificationCardProps extends HTMLAttributes<HTMLDivElement> {
  title:     string;
  message:   string;
  time:      string;
  read?:     boolean;
  icon?:     ReactNode;
  onMarkRead?: () => void;
}

export function NotificationCard({ title, message, time, read = false, icon, onMarkRead, className, ...props }: NotificationCardProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg border transition-colors",
        read ? "bg-card border-border" : "bg-primary/5 border-primary/20",
        className,
      )}
      {...props}
    >
      {icon && <div className="shrink-0 mt-0.5">{icon}</div>}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn("text-sm font-medium truncate", !read && "text-primary")}>{title}</p>
          {!read && (
            <button onClick={onMarkRead} className="shrink-0 text-xs text-muted-foreground hover:text-foreground">
              Mark read
            </button>
          )}
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{message}</p>
        <p className="mt-1 text-2xs text-muted-foreground/70">{time}</p>
      </div>
      {!read && <div className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />}
    </div>
  );
}

// ─── Timeline Card ────────────────────────────────────────────────────────────
export interface TimelineCardProps extends HTMLAttributes<HTMLDivElement> {
  title:       string;
  description?: string;
  timestamp:   string;
  status?:     "completed" | "active" | "pending" | "skipped";
  icon?:       ReactNode;
  isLast?:     boolean;
}

const timelineStatusStyles = {
  completed: "bg-emerald-500 border-emerald-500",
  active:    "bg-primary border-primary",
  pending:   "bg-muted-foreground/30 border-muted-foreground/30",
  skipped:   "bg-muted border-muted-foreground/20",
};

export function TimelineCard({ title, description, timestamp, status = "pending", icon, isLast = false, className, ...props }: TimelineCardProps) {
  return (
    <div className={cn("flex gap-4", className)} {...props}>
      <div className="flex flex-col items-center">
        <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-white text-xs", timelineStatusStyles[status])}>
          {icon ?? (status === "completed" ? "✓" : null)}
        </div>
        {!isLast && <div className="mt-1 w-0.5 flex-1 bg-border" />}
      </div>
      <div className={cn("pb-6 min-w-0", isLast && "pb-0")}>
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
        <p className="mt-1 text-2xs text-muted-foreground/70">{timestamp}</p>
      </div>
    </div>
  );
}

// ─── Graph Card ───────────────────────────────────────────────────────────────
export interface GraphCardProps extends HTMLAttributes<HTMLDivElement> {
  title:        string;
  description?: string;
  actions?:     ReactNode;
  height?:      number;
}

export function GraphCard({ title, description, actions, height = 220, children, className, ...props }: GraphCardProps) {
  return (
    <Card className={cn("", className)} {...props}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      </CardHeader>
      <CardContent>
        <div style={{ height }} className="w-full">{children}</div>
      </CardContent>
    </Card>
  );
}
