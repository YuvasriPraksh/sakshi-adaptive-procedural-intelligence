import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/router/routes";

export interface ErrorLayoutProps {
  children:   ReactNode;
  className?: string;
}

export function ErrorLayout({ children, className }: ErrorLayoutProps) {
  return (
    <div className={cn("min-h-screen flex flex-col bg-background", className)}>
      <header className="h-16 border-b border-border flex items-center px-6">
        <Link to={ROUTES.HOME} className="flex items-center gap-2 no-underline">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--primary))] text-white font-bold text-sm">S</div>
          <span className="text-base font-bold text-foreground">SAKSHI</span>
        </Link>
      </header>
      <main className="flex-1 center-page">{children}</main>
    </div>
  );
}
