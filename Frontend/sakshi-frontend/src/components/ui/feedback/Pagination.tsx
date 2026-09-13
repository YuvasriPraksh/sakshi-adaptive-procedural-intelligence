import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/buttons";

export interface PaginationProps {
  page:        number;
  totalPages:  number;
  onPageChange: (page: number) => void;
  pageSize?:   number;
  total?:      number;
  showInfo?:   boolean;
  siblingCount?: number;
  className?:  string;
}

function buildPages(current: number, total: number, siblings: number): (number | "…")[] {
  const delta = siblings + 2;
  const range: number[] = [];
  for (let i = Math.max(2, current - siblings); i <= Math.min(total - 1, current + siblings); i++) {
    range.push(i);
  }
  const pages: (number | "…")[] = [1];
  if (range[0] > 2) pages.push("…");
  pages.push(...range);
  if (range[range.length - 1] < total - 1) pages.push("…");
  if (total > 1) pages.push(total);
  return total === 1 ? [1] : pages;
  void delta;
}

export function Pagination({ page, totalPages, onPageChange, total, pageSize, showInfo = true, siblingCount = 1, className }: PaginationProps) {
  const pages = buildPages(page, totalPages, siblingCount);
  const from  = pageSize ? (page - 1) * pageSize + 1 : undefined;
  const to    = pageSize ? Math.min(page * pageSize, total ?? 0) : undefined;

  return (
    <div className={cn("flex items-center justify-between flex-wrap gap-3", className)}>
      {showInfo && total !== undefined && (
        <p className="text-xs text-muted-foreground">
          {from && to ? `Showing ${from}–${to} of ${total}` : `${total} results`}
        </p>
      )}
      <div className="flex items-center gap-1 ml-auto">
        <Button variant="ghost" size="icon-sm" onClick={() => onPageChange(1)} disabled={page === 1} aria-label="First page">
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={() => onPageChange(page - 1)} disabled={page === 1} aria-label="Previous page">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {pages.map((p, i) =>
          p === "…" ? (
            <span key={`ellipsis-${i}`} className="px-1 text-muted-foreground text-xs">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={cn(
                "h-7 min-w-7 px-2 rounded-md text-xs font-medium transition-colors",
                p === page
                  ? "bg-[hsl(var(--primary))] text-white"
                  : "text-foreground hover:bg-muted",
              )}
              aria-current={p === page ? "page" : undefined}
            >
              {p}
            </button>
          ),
        )}
        <Button variant="ghost" size="icon-sm" onClick={() => onPageChange(page + 1)} disabled={page === totalPages} aria-label="Next page">
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={() => onPageChange(totalPages)} disabled={page === totalPages} aria-label="Last page">
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
