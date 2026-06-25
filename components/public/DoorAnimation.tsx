"use client";

import { useEffect, useState } from "react";

export function DoorAnimation() {
  const [status, setStatus] = useState<"idle" | "opening" | "done">("idle");

  useEffect(() => {
    // Show only once per browser session
    if (sessionStorage.getItem("gd-intro")) {
      setStatus("done");
      return;
    }
    sessionStorage.setItem("gd-intro", "1");

    const t1 = setTimeout(() => setStatus("opening"), 400);
    const t2 = setTimeout(() => setStatus("done"), 1750);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (status === "done") return null;

  const isOpen = status === "opening";
  const panelTransition = isOpen
    ? "transform 1.25s cubic-bezier(0.76, 0, 0.24, 1)"
    : "none";

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[9999] flex overflow-hidden"
    >
      {/* ── Left door panel ──────────────────────────────── */}
      <div
        className="relative w-1/2 h-full bg-[#0f1b3c]"
        style={{
          transform: isOpen ? "translateX(-100%)" : "translateX(0)",
          transition: panelTransition,
          willChange: "transform",
        }}
      >
        {/* Decorative inset border (door panel moulding) */}
        <div className="absolute inset-5  border border-[#c9a227]/18 rounded-sm" />
        <div className="absolute inset-10 border border-[#c9a227]/08 rounded-sm" />

        {/* Brand block — right half of centre seam */}
        <div className="absolute right-7 top-1/2 -translate-y-1/2 text-right select-none">
          <div className="w-16 h-16 rounded-full bg-[#c9a227] flex items-center justify-center font-bold text-[#0f1b3c] text-3xl mb-4 ml-auto shadow-[0_0_24px_rgba(201,162,39,0.35)]">
            G
          </div>
          <p className="text-white font-bold text-base tracking-[0.18em] uppercase leading-tight">
            Gravodaya
          </p>
          <p className="text-[#c9a227] text-[9px] tracking-[0.22em] uppercase mt-1 opacity-80">
            Developers Pvt. Ltd.
          </p>
        </div>

        {/* Gold seam edge */}
        <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#c9a227]/60 to-transparent" />
      </div>

      {/* ── Right door panel ─────────────────────────────── */}
      <div
        className="relative w-1/2 h-full bg-[#0b1628]"
        style={{
          transform: isOpen ? "translateX(100%)" : "translateX(0)",
          transition: panelTransition,
          willChange: "transform",
        }}
      >
        {/* Decorative moulding */}
        <div className="absolute inset-5  border border-[#c9a227]/18 rounded-sm" />
        <div className="absolute inset-10 border border-[#c9a227]/08 rounded-sm" />

        {/* Door knob */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          <div className="w-5 h-5 rounded-full bg-[#c9a227] shadow-[0_0_14px_rgba(201,162,39,0.55)]" />
        </div>

        {/* City tagline */}
        <div className="absolute left-11 top-1/2 -translate-y-1/2 select-none">
          <p className="text-white/30 text-xs tracking-[0.2em] uppercase">Dehradun</p>
          <p className="text-white/15 text-[10px] tracking-[0.18em] uppercase mt-0.5">
            Uttarakhand
          </p>
        </div>

        {/* Gold seam edge */}
        <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#c9a227]/60 to-transparent" />
      </div>
    </div>
  );
}
