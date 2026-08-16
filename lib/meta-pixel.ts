"use client";

// Client-side helpers for firing Meta Pixel events. Safe to call anywhere:
// no-ops on the server or when the Pixel isn't configured/loaded.

import { useEffect, useRef } from "react";

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

/**
 * Fires `event` the first time `fired` flips true (e.g. form submit succeeded).
 * The ref guard keeps one action to one event: re-renders, a `fired` value that
 * toggles, and React's development double-invoke can't send it twice.
 */
export function usePixelOnce(fired: boolean, event: string, params?: PixelParams) {
  const sent = useRef(false);
  useEffect(() => {
    if (!fired || sent.current) return;
    sent.current = true;
    trackPixel(event, params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fired]);
}
