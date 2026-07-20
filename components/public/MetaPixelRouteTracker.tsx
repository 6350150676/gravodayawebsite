"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackPixel } from "@/lib/meta-pixel";

/**
 * Fires PageView on client-side route changes. The initial page load is
 * already tracked by the Pixel bootstrap script, so the first render is
 * skipped to avoid double-counting.
 */
export function MetaPixelRouteTracker() {
  const pathname = usePathname();
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    trackPixel("PageView");
  }, [pathname]);

  return null;
}
