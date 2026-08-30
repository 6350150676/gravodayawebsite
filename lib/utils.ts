import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  if (price >= 10_000_000) {
    return `₹${(price / 10_000_000).toFixed(2)} Cr`;
  }
  if (price >= 100_000) {
    return `₹${(price / 100_000).toFixed(2)} L`;
  }
  return `₹${price.toLocaleString("en-IN")}`;
}

// Same lakh/crore buckets as formatPrice, but without the forced two
// decimals — a range reads better as "₹80 L – ₹2 Cr" than "₹80.00 L – ₹2.00 Cr".
function compactPrice(price: number): string {
  if (price >= 10_000_000) return `₹${trimZeros(price / 10_000_000)} Cr`;
  if (price >= 100_000) return `₹${trimZeros(price / 100_000)} L`;
  return `₹${price.toLocaleString("en-IN")}`;
}

function trimZeros(n: number): string {
  return n.toFixed(2).replace(/\.?0+$/, "");
}

// Projects price as a span, and either end may be missing.
export function formatPriceRange(
  min: number | null,
  max: number | null,
): string | null {
  if (min && max) {
    return min === max ? compactPrice(min) : `${compactPrice(min)} – ${compactPrice(max)}`;
  }
  if (min) return `From ${compactPrice(min)}`;
  if (max) return `Up to ${compactPrice(max)}`;
  return null;
}

// A slug is the URL people paste into WhatsApp and the line Google prints under
// a result, so it's capped at a readable length — cut back to a word boundary
// rather than mid-word, and never left ending on a dash.
export function slugify(text: string, maxLength = 50): string {
  const slug = text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (slug.length <= maxLength) return slug;
  const cut = slug.slice(0, maxLength);
  const lastDash = cut.lastIndexOf("-");
  return (lastDash > 0 ? cut.slice(0, lastDash) : cut).replace(/-+$/, "");
}
