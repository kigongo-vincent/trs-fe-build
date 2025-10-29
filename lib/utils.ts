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

// Dark gray from sidebar (bg-gray-900)
export const GRAPH_DARK_GRAY = "#111827";

// Generate color variations for charts - alternating between primary and dark gray variations
export const getChartColorVariations = (count: number): string[] => {
  // Primary color variations
  const primaryColors = [
    "#F6931B", // Base primary
    "#FFA64D", // Lighter primary
    "#E8820F", // Darker primary
    "#FFB880", // Very light primary
    "#D67108", // Very dark primary
  ];

  // Dark gray variations
  const grayColors = [
    "#111827", // Base dark gray (gray-900)
    "#1F2937", // gray-800
    "#374151", // gray-700
    "#4B5563", // gray-600
    "#6B7280", // gray-500
  ];

  const colors: string[] = [];
  for (let i = 0; i < count; i++) {
    if (i % 2 === 0) {
      // Even indices: use primary variations
      colors.push(primaryColors[Math.floor(i / 2) % primaryColors.length]);
    } else {
      // Odd indices: use dark gray variations
      colors.push(grayColors[Math.floor(i / 2) % grayColors.length]);
    }
  }
  return colors;
};

export const textCropper = (string: string, limit: number): string => {
  const stringLength = string.length;
  return stringLength > limit ? `${string.slice(0, limit - 3)}...` : string;
};
