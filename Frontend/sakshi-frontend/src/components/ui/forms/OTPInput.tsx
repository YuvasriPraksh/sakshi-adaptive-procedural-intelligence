import { useRef, type ClipboardEvent, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";
import { FieldWrapper } from "./FormField";

export interface OTPInputProps {
  length?:   number;
  value:     string;
  onChange:  (val: string) => void;
  label?:    string;
  error?:    string;
  disabled?: boolean;
}

export function OTPInput({ length = 6, value, onChange, label, error, disabled }: OTPInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const digits    = value.split("").concat(Array(length).fill("")).slice(0, length);

  const focus = (i: number) => inputsRef.current[i]?.focus();

  const handleChange = (i: number, val: string) => {
    const clean = val.replace(/\D/g, "").slice(-1);
    const arr   = digits.slice();
    arr[i]      = clean;
    onChange(arr.join(""));
    if (clean && i < length - 1) focus(i + 1);
  };

  const handleKey = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) focus(i - 1);
    if (e.key === "ArrowLeft"  && i > 0)            focus(i - 1);
    if (e.key === "ArrowRight" && i < length - 1)   focus(i + 1);
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    onChange(pasted.padEnd(length, "").slice(0, length).trimEnd());
    focus(Math.min(pasted.length, length - 1));
  };

  return (
    <FieldWrapper label={label} error={error}>
      <div className="flex items-center gap-2" role="group" aria-label={label ?? "OTP input"}>
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={el => { inputsRef.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            disabled={disabled}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKey(i, e)}
            onPaste={handlePaste}
            className={cn(
              "h-11 w-11 rounded-md border text-center text-lg font-semibold",
              "bg-background transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              error ? "border-danger-500" : "border-input",
            )}
            aria-label={`Digit ${i + 1}`}
          />
        ))}
      </div>
    </FieldWrapper>
  );
}
