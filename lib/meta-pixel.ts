"use client";

// Client-side helpers for firing Meta Pixel events. Safe to call anywhere:
// no-ops on the server or when the Pixel isn't configured/loaded.

import { useEffect } from "react";

export type PixelParams = Record<string, string | number | string[] | undefined>;

declare global {
  interface Window {
    fbq?: (command: "track" | "trackCustom", event: string, params?: PixelParams) => void;
  }
}

export function trackPixel(event: string, params?: PixelParams) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  window.fbq("track", event, params);
}

/** Fires a "Lead" event once when `fired` flips true (e.g. form submit succeeded). */
export function useLeadPixel(fired: boolean, params?: PixelParams) {
  useEffect(() => {
    if (fired) trackPixel("Lead", params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fired]);
}
