import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Manual thousands-separator formatting instead of toLocaleString("kk-KZ"):
// Node's ICU data and the browser's Intl implementation don't always agree
// on kk-KZ grouping, which caused server/client hydration mismatches.
export function formatThousands(value: number) {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}
