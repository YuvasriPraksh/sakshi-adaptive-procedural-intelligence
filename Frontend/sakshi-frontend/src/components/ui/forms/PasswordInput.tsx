import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { TextInput, type TextInputProps } from "./TextInput";

export type PasswordInputProps = Omit<TextInputProps, "type" | "rightElement">;

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>((props, ref) => {
  const [show, setShow] = useState(false);
  return (
    <TextInput
      ref={ref}
      type={show ? "text" : "password"}
      autoComplete="current-password"
      rightElement={
        <button
          type="button"
          onClick={() => setShow(v => !v)}
          className="hover:text-foreground transition-colors"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      }
      {...props}
    />
  );
});
PasswordInput.displayName = "PasswordInput";
