import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

// ─── Variants ─────────────────────────────────────────────────────────────────
const buttonVariants = cva(
  // base
  [
    "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium",
    "transition-all duration-150 select-none cursor-pointer",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "active:scale-[0.98]",
  ],
  {
    variants: {
      variant: {
        primary:
          "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/90 shadow-sm",
        secondary:
          "bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] hover:bg-[hsl(var(--secondary))]/90 shadow-sm",
        outline:
          "border border-border bg-transparent text-foreground hover:bg-muted hover:text-foreground",
        ghost:
          "bg-transparent text-foreground hover:bg-muted hover:text-foreground",
        success:
          "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm",
        warning:
          "bg-amber-500 text-white hover:bg-amber-600 shadow-sm",
        danger:
          "bg-danger-600 text-white hover:bg-danger-700 shadow-sm",
        link:
          "text-[hsl(var(--primary))] underline-offset-4 hover:underline p-0 h-auto",
        muted:
          "bg-muted text-muted-foreground hover:bg-muted/80",
      },
      size: {
        xs:   "h-7  px-2.5 text-xs gap-1",
        sm:   "h-8  px-3   text-xs gap-1.5",
        md:   "h-9  px-4   text-sm",
        lg:   "h-10 px-6   text-sm",
        xl:   "h-12 px-8   text-base",
        icon: "h-9  w-9   p-0",
        "icon-sm": "h-7 w-7 p-0",
        "icon-lg": "h-11 w-11 p-0",
      },
      fullWidth: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size:    "md",
    },
  },
);

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?:     boolean;
  leftIcon?:    React.ReactNode;
  rightIcon?:   React.ReactNode;
  fullWidth?:   boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      loading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        {children && <span>{children}</span>}
        {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  },
);
Button.displayName = "Button";

// ─── Convenience exports ──────────────────────────────────────────────────────
export { buttonVariants };

export const PrimaryButton   = forwardRef<HTMLButtonElement, Omit<ButtonProps, "variant">>((p, r) => <Button ref={r} variant="primary"   {...p} />);
export const SecondaryButton = forwardRef<HTMLButtonElement, Omit<ButtonProps, "variant">>((p, r) => <Button ref={r} variant="secondary" {...p} />);
export const OutlineButton   = forwardRef<HTMLButtonElement, Omit<ButtonProps, "variant">>((p, r) => <Button ref={r} variant="outline"   {...p} />);
export const GhostButton     = forwardRef<HTMLButtonElement, Omit<ButtonProps, "variant">>((p, r) => <Button ref={r} variant="ghost"     {...p} />);
export const SuccessButton   = forwardRef<HTMLButtonElement, Omit<ButtonProps, "variant">>((p, r) => <Button ref={r} variant="success"   {...p} />);
export const WarningButton   = forwardRef<HTMLButtonElement, Omit<ButtonProps, "variant">>((p, r) => <Button ref={r} variant="warning"   {...p} />);
export const DangerButton    = forwardRef<HTMLButtonElement, Omit<ButtonProps, "variant">>((p, r) => <Button ref={r} variant="danger"    {...p} />);
export const IconButton      = forwardRef<HTMLButtonElement, Omit<ButtonProps, "size">>((p, r) => <Button ref={r} size="icon" {...p} />);

PrimaryButton.displayName   = "PrimaryButton";
SecondaryButton.displayName = "SecondaryButton";
OutlineButton.displayName   = "OutlineButton";
GhostButton.displayName     = "GhostButton";
SuccessButton.displayName   = "SuccessButton";
WarningButton.displayName   = "WarningButton";
DangerButton.displayName    = "DangerButton";
IconButton.displayName      = "IconButton";
