"use client";

import { useEffect, useState } from "react";

/**
 * First-visit intro: a simple house is sketched line-by-line, then its front
 * door swings open on its hinges and the "camera" dollies forward through the
 * doorway — so it feels like the gate opens and you step inside before the
 * site (visible through the open door) fills the screen.
 *
 * It is one SVG: a sand "wall" with the doorway punched out (transparent, via
 * a mask) so the real page shows through it; two terracotta leaves cover that
 * hole, swing open, then the whole group scales up about the doorway.
 *
 * - Pure CSS / SVG — no animation library; timing lives in globals.css.
 * - Plays once per browser session (sessionStorage).
 * - Skipped for users who prefer reduced motion (CSS + JS guard).
 */
export function IntroGate() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduce || sessionStorage.getItem("gd-intro")) {
      setDone(true);
      return;
    }

    // Flag is set on COMPLETION (not on mount) so React StrictMode's
    // double-invoke in dev doesn't skip the animation on first load.
    // draw (~1.75s) → door swings open (2.1s) → walk in (3.6s) → unmount.
    // Keep in sync with the timeline in globals.css (.gd-camera / .gd-art).
    const t = setTimeout(() => {
      sessionStorage.setItem("gd-intro", "1");
      setDone(true);
    }, 5050);
    return () => clearTimeout(t);
  }, []);

  if (done) return null;

  return (
    <div aria-hidden="true" className="gd-intro">
      <svg
        className="gd-overlay"
        viewBox="0 0 440 340"
        preserveAspectRatio="xMidYMid slice"
        role="img"
      >
        <defs>
          {/* White = keep the wall, black = punch the doorway through to the
              page behind. Coords are the door interior in canvas units. */}
          <mask id="gd-door-mask">
            <rect x="0" y="0" width="440" height="340" fill="#fff" />
            <rect x="210" y="197" width="20" height="38" fill="#000" />
          </mask>
        </defs>

        {/* The wall scales forward on the walk-in (solid sand → clean reveal
            as the doorway hole grows to engulf the screen). */}
        <g className="gd-camera">
          <rect
            x="0"
            y="0"
            width="440"
            height="340"
            style={{ fill: "var(--color-sand)" }}
            mask="url(#gd-door-mask)"
          />
        </g>

        {/* The line drawing + door leaves sit on top and FADE on the walk-in
            (they don't scale, so they never smear across the screen). */}
        <g className="gd-art" transform="translate(110, 85)">
          {STROKES.map((s, i) => (
            <path
              key={i}
              d={s.d}
              pathLength={1}
              className="gd-stroke"
              style={{ animationDelay: `${s.delay}s` }}
            />
          ))}

          {/* Door leaves — terracotta, swing open over the hole */}
          <g className="gd-leaf gd-leaf-left">
            <rect x="100" y="112" width="10" height="38" />
          </g>
          <g className="gd-leaf gd-leaf-right">
            <rect x="110" y="112" width="10" height="38" />
            <circle cx="116" cy="131" r="1.8" className="gd-dot" />
          </g>
        </g>
      </svg>

      <div className="gd-wordmark select-none">
        <p
          className="font-bold uppercase tracking-[0.28em] text-[var(--color-brand)]"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Gravodaya
        </p>
        <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-[var(--color-gold)]">
          Developers
        </p>
      </div>
    </div>
  );
}

/* Stroke order + stagger (house-local coords). Each line draws over 0.65s;
   the ~0.16s step lets you watch them appear one at a time. */
const STROKES: { d: string; delay: number }[] = [
  { d: "M10 150 H210", delay: 0 }, // ground
  { d: "M55 150 V82", delay: 0.16 }, // left wall
  { d: "M165 150 V82", delay: 0.32 }, // right wall
  { d: "M45 84 L110 36 L175 84", delay: 0.5 }, // roof
  { d: "M140 60 V40 H152 V70", delay: 0.66 }, // chimney
  { d: "M72 96 H98 V122 H72 Z M85 96 V122 M72 109 H98", delay: 0.82 }, // window L
  { d: "M122 96 H148 V122 H122 Z M135 96 V122 M122 109 H148", delay: 0.98 }, // window R
  { d: "M100 150 V112 H120 V150", delay: 1.14 }, // door frame
];
