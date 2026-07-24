import { cn } from "@/lib/utils";

export function Footer({ className }: { className?: string }) {
  return (
    <footer
      className={cn(
        "shrink-0 h-10 flex items-center justify-between px-4 sm:px-6",
        "border-t border-border bg-card/60 text-2xs text-muted-foreground/70",
        className,
      )}
      aria-label="Application footer"
    >
      <span>© {new Date().getFullYear()} SAKSHI · POCSO Intelligence Platform</span>
      <span className="hidden sm:block">
        Ministry of Women &amp; Child Development · Government of India
      </span>
    </footer>
  );
}
