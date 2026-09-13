import { forwardRef } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchBoxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  onClear?:   () => void;
  inputSize?: "sm" | "md" | "lg";
}

const sizeClasses = { sm: "h-8 text-xs", md: "h-9 text-sm", lg: "h-11 text-base" };

export const SearchBox = forwardRef<HTMLInputElement, SearchBoxProps>(
  ({ onClear, inputSize = "md", className, value, ...props }, ref) => (
    <div className="relative flex items-center">
      <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
      <input
        ref={ref}
        type="search"
        value={value}
        className={cn(
          "input-base pl-9",
          onClear && value ? "pr-9" : "",
          sizeClasses[inputSize],
          className,
        )}
        {...props}
      />
      {onClear && value && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear search"
          className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  ),
);
SearchBox.displayName = "SearchBox";
