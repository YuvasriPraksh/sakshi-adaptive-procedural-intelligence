import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind CSS class names, resolving conflicts with tailwind-merge.
 * This is the standard Shadcn UI utility function.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
