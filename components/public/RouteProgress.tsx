"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Top loading bar for App Router navigations.
 *
 * Duration is driven by the REAL navigation time, not a fixed timer:
 *  - it starts the instant an internal link is clicked (or back/forward is used)
 *  - while the page (and its server data) is loading it "trickles" forward,
 *    creeping slower the longer it waits — so a slow API/page shows a longer
 *    animation and a fast one snaps to done almost instantly
 *  - it completes as soon as the new route actually commits (pathname/query change)
 *
 * It's a pure visual overlay — it never blocks or delays the navigation itself.
 */
export function RouteProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 0 = hidden, 1..99 = loading, 100 = finishing
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  const trickle = useRef<ReturnType<typeof setInterval> | null>(null);
  const fadeOut = useRef<ReturnType<typeof setTimeout> | null>(null);
  const active = useRef(false);

  const clearTimers = () => {
    if (trickle.current) clearInterval(trickle.current);
    if (fadeOut.current) clearTimeout(fadeOut.current);
    trickle.current = null;
    fadeOut.current = null;
  };

  const start = () => {
    if (active.current) return;
    active.current = true;
    clearTimers();
    setVisible(true);
    setProgress(8);
    // Trickle forward; steps shrink as we approach the cap so the bar keeps
    // moving (reassuring the user) but never "finishes" until the page does.
    trickle.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) return p;
        const remaining = 90 - p;
        return p + Math.max(0.4, remaining * 0.06);
      });
    }, 180);
  };

  const done = () => {
    if (!active.current) return;
    active.current = false;
    clearTimers();
    setProgress(100);
    fadeOut.current = setTimeout(() => {
      setVisible(false);
      // reset after the fade so the next run starts clean
      setTimeout(() => setProgress(0), 200);
    }, 250);
  };

  // Detect the START of a navigation.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented) return;
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const anchor = (e.target as HTMLElement)?.closest?.("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }
      // external links / tel: / mailto: → let the browser handle it, no bar
      if (url.origin !== window.location.origin) return;
      // same URL (incl. hash-only) → no navigation
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;

      start();
    };

    const onPopState = () => start();

    document.addEventListener("click", onClick, { capture: true });
    window.addEventListener("popstate", onPopState);
    return () => {
      document.removeEventListener("click", onClick, { capture: true });
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  // Detect the END of a navigation: the route committed.
  useEffect(() => {
    done();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  useEffect(() => () => clearTimers(), []);

  if (!visible) return null;

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        zIndex: 100,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${progress}%`,
          background: "var(--color-gold)",
          boxShadow: "0 0 8px var(--color-gold), 0 0 4px var(--color-gold)",
          borderRadius: "0 2px 2px 0",
          transition:
            progress === 100
              ? "width 200ms ease-out"
              : "width 180ms linear",
        }}
      />
    </div>
  );
}
