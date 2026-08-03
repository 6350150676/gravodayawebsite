"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const START_AT = 8; // first visible sliver
const CAP = 90; // trickle never crosses this until the route commits
const TRICKLE_MS = 180;
const MIN_VISIBLE_MS = 400; // fast routes still show a full sweep, not a stub
const COMPLETE_MS = 260; // width -> 100%
const FADE_MS = 260; // opacity fade once full
const SAFETY_MS = 10000; // never leave the bar stranded

// Top loading bar: starts on internal link clicks, trickles while the route
// loads, then always runs the width to 100% and fades out — it is never
// unmounted mid-sweep.
export function RouteProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"idle" | "loading" | "fading">("idle");

  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());
  const trickle = useRef<ReturnType<typeof setInterval> | null>(null);
  const frame = useRef<number | null>(null);
  const startedAt = useRef(0);
  const active = useRef(false);

  // every timer goes through here so clearAll() can cancel all of them
  const later = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(() => {
      timers.current.delete(id);
      fn();
    }, ms);
    timers.current.add(id);
  }, []);

  const clearAll = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current.clear();
    if (trickle.current) clearInterval(trickle.current);
    trickle.current = null;
    if (frame.current) cancelAnimationFrame(frame.current);
    frame.current = null;
  }, []);

  const finish = useCallback(() => {
    if (!active.current) return;
    active.current = false;
    clearAll();

    // hold briefly on very fast routes so the sweep to 100% is actually seen
    const hold = Math.max(0, MIN_VISIBLE_MS - (Date.now() - startedAt.current));

    later(() => {
      setProgress(100);
      // stay mounted for the whole 100% transition, then fade the bar out
      later(() => {
        setPhase("fading");
        later(() => {
          setPhase("idle");
          setProgress(0);
        }, FADE_MS);
      }, COMPLETE_MS);
    }, hold);
  }, [clearAll, later]);

  const start = useCallback(() => {
    if (active.current) return;
    active.current = true;
    clearAll();
    startedAt.current = Date.now();

    setPhase("loading");
    setProgress(0);
    // paint at 0 first so the bar grows in from the left edge
    frame.current = requestAnimationFrame(() => {
      frame.current = requestAnimationFrame(() => setProgress(START_AT));
    });

    // steps shrink toward the cap so the bar never finishes early
    trickle.current = setInterval(() => {
      setProgress((p) => (p >= CAP ? p : p + Math.max(0.4, (CAP - p) * 0.06)));
    }, TRICKLE_MS);

    // a click that never produces a route change must not strand the bar
    later(finish, SAFETY_MS);
  }, [clearAll, later, finish]);

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
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;

      start();
    };

    const onPopState = () => start();
    // bfcache restore / hard navigation away: don't come back to a stuck bar
    const onPageHide = () => finish();

    document.addEventListener("click", onClick, { capture: true });
    window.addEventListener("popstate", onPopState);
    window.addEventListener("pagehide", onPageHide);
    return () => {
      document.removeEventListener("click", onClick, { capture: true });
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, [start, finish]);

  // route committed
  useEffect(() => {
    finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  useEffect(() => () => clearAll(), [clearAll]);

  if (phase === "idle") return null;

  const complete = progress >= 100;

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
        opacity: phase === "fading" ? 0 : 1,
        transition: `opacity ${FADE_MS}ms ease-out`,
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${progress}%`,
          background: "var(--color-gold)",
          boxShadow: "0 0 8px var(--color-gold), 0 0 4px var(--color-gold)",
          borderRadius: complete ? 0 : "0 2px 2px 0",
          transition: complete
            ? `width ${COMPLETE_MS}ms ease-out`
            : `width ${TRICKLE_MS}ms linear`,
        }}
      />
    </div>
  );
}
