import { cn } from "@/lib/utils";

export interface FooterProps {
  className?: string;
}

const year = new Date().getFullYear();

export function Footer({ className }: FooterProps) {
  return (
    <footer
      className={cn(
        "h-[48px] flex items-center justify-between px-6",
        "border-t border-border bg-card/50 text-xs text-muted-foreground",
        className,
      )}
    >
      <span>© {year} SAKSHI — AI-Powered Procedural Intelligence Platform</span>
      <span className="hidden sm:block">Ministry of Women &amp; Child Development · POCSO Investigation Support</span>
    </footer>
  );
}
