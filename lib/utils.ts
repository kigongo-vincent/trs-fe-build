import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency: string = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

// Global graph color using primary color
export const GRAPH_PRIMARY_COLOR = "#F6931B";

export const textCropper = (string: string, limit: number): string => {
  const stringLength = string.length;
  return stringLength > limit ? `${string.slice(0, limit - 3)}...` : string;
};
