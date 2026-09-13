import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ToastContainer } from "@/components/ui/feedback/Toast";
import { ROUTES } from "@/router/routes";

export interface PublicLayoutProps {
  children:   ReactNode;
  className?: string;
}

export function PublicLayout({ children, className }: PublicLayoutProps) {
  return (
    <div className={cn("min-h-screen flex flex-col bg-background", className)}>
      {/* Top bar */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to={ROUTES.HOME} className="flex items-center gap-2.5 no-underline">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--primary))] text-white font-bold text-sm">
              S
            </div>
            <span className="text-base font-bold text-foreground">SAKSHI</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link to={ROUTES.HOME} className="text-sm text-muted-foreground hover:text-foreground transition-colors no-underline">Home</Link>
            <Link to={ROUTES.LOGIN} className="text-sm font-medium text-[hsl(var(--primary))] hover:underline no-underline">Sign In</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border bg-card/50 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} SAKSHI · Ministry of Women &amp; Child Development · Government of India
      </footer>

      <ToastContainer />
    </div>
  );
}
