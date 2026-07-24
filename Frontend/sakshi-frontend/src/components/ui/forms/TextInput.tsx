import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { FieldWrapper } from "./FormField";

export interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?:        string;
  error?:        string;
  hint?:         string;
  leftElement?:  ReactNode;
  rightElement?: ReactNode;
  inputSize?:    "sm" | "md" | "lg";
}

const sizeClasses = { sm: "h-8 text-xs px-2.5", md: "h-9 text-sm px-3", lg: "h-11 text-base px-4" };

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ label, error, hint, leftElement, rightElement, inputSize = "md", className, id, required, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <FieldWrapper label={label} htmlFor={inputId} required={required} error={error} hint={hint}>
        <div className="relative flex items-center">
          {leftElement && (
            <span className="absolute left-3 flex items-center text-muted-foreground pointer-events-none">
              {leftElement}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            className={cn(
              "input-base",
              sizeClasses[inputSize],
              leftElement  && "pl-9",
              rightElement && "pr-9",
              error && "border-danger-500 focus-visible:ring-danger-500",
              className,
            )}
            {...props}
          />
          {rightElement && (
            <span className="absolute right-3 flex items-center text-muted-foreground">
              {rightElement}
            </span>
          )}
        </div>
      </FieldWrapper>
    );
  },
);
TextInput.displayName = "TextInput";
