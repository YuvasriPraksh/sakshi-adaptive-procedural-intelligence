import { forwardRef } from "react";
import { Calendar } from "lucide-react";
import { TextInput, type TextInputProps } from "./TextInput";

export type DatePickerProps = Omit<TextInputProps, "type" | "leftElement">;

/**
 * Lightweight date picker — wraps the native <input type="date">.
 * Swap with a headless library (react-day-picker) when richer UX is needed.
 */
export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>((props, ref) => (
  <TextInput
    ref={ref}
    type="date"
    leftElement={<Calendar className="h-4 w-4" />}
    {...props}
  />
));
DatePicker.displayName = "DatePicker";
