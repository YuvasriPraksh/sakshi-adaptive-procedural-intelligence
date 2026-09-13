import { Fragment } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label:  string;
  href?:  string;
  icon?:  React.ReactNode;
}

export interface BreadcrumbProps {
  items:     BreadcrumbItem[];
  showHome?: boolean;
  className?: string;
}

export function Breadcrumb({ items, showHome = true, className }: BreadcrumbProps) {
  const all = showHome
    ? [{ label: "Home", href: "/", icon: <Home className="h-3.5 w-3.5" /> }, ...items]
    : items;

  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center", className)}>
      <ol className="flex items-center gap-1">
        {all.map((item, i) => {
          const isLast = i === all.length - 1;
          return (
            <Fragment key={i}>
              <li className="flex items-center">
                {item.href && !isLast ? (
                  <Link
                    to={item.href}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ) : (
                  <span className={cn(
                    "flex items-center gap-1 text-xs",
                    isLast ? "text-foreground font-medium" : "text-muted-foreground",
                  )}>
                    {item.icon}
                    <span>{item.label}</span>
                  </span>
                )}
              </li>
              {!isLast && <ChevronRight className="h-3 w-3 text-muted-foreground/60 flex-shrink-0" />}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
