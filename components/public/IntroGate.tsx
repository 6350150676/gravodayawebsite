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
    sessionStorage.setItem("gd-intro", "1");

    // draw (~1.6s) → leaves swing open (2.0s) → dolly in (2.75s) → unmount.
    const t = setTimeout(() => setDone(true), 3850);
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

        <g className="gd-camera">
          {/* Sand wall with the doorway cut out */}
          <rect
            x="0"
            y="0"
            width="440"
            height="340"
            style={{ fill: "var(--color-sand)" }}
            mask="url(#gd-door-mask)"
          />

          {/* House drawing, centred in the larger canvas */}
          <g transform="translate(110, 85)">
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

/* Stroke order + stagger (house-local coords). Each line draws over 0.55s. */
const STROKES: { d: string; delay: number }[] = [
  { d: "M10 150 H210", delay: 0 }, // ground
  { d: "M55 150 V82", delay: 0.12 }, // left wall
  { d: "M165 150 V82", delay: 0.24 }, // right wall
  { d: "M45 84 L110 36 L175 84", delay: 0.42 }, // roof
  { d: "M140 60 V40 H152 V70", delay: 0.58 }, // chimney
  { d: "M72 96 H98 V122 H72 Z M85 96 V122 M72 109 H98", delay: 0.74 }, // window L
  { d: "M122 96 H148 V122 H122 Z M135 96 V122 M122 109 H148", delay: 0.9 }, // window R
  { d: "M100 150 V112 H120 V150", delay: 1.06 }, // door frame
];
