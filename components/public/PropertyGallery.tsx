"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X, Expand, ImageIcon } from "lucide-react";

interface Props {
  images: { url: string; alt: string }[];
  /** Badges rendered over the top-left of the main image */
  badges?: React.ReactNode;
}

export function PropertyGallery({ images, badges }: Props) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  const count = images.length;

  const go = useCallback(
    (dir: number) => setActive((i) => (i + dir + count) % count),
    [count],
  );

  function openLightbox(e: React.MouseEvent) {
    lastFocusedRef.current = e.currentTarget as HTMLElement;
    setLightbox(true);
  }

  // Keyboard navigation, scroll-lock and focus management while open
  useEffect(() => {
    if (!lightbox) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setLightbox(false); return; }
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
      // Trap focus inside the dialog
      if (e.key === "Tab") {
        const focusables = dialogRef.current?.querySelectorAll<HTMLElement>("button");
        if (focusables && focusables.length) {
          const first = focusables[0];
          const last = focusables[focusables.length - 1];
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      }
    };

    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    closeBtnRef.current?.focus();

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      lastFocusedRef.current?.focus();
    };
  }, [lightbox, go]);

  // ── Empty state ──────────────────────────────────────────────
  if (count === 0) {
    return (
      <div className="aspect-[16/10] w-full rounded-2xl bg-gray-100 flex flex-col items-center justify-center text-gray-300 gap-2">
        <ImageIcon size={56} strokeWidth={1} />
        <span className="text-sm">No photos available</span>
      </div>
    );
  }

  return (
    <>
      {/* ── Main image ──────────────────────────────────────────── */}
      <div className="relative group">
        <button
          type="button"
          onClick={openLightbox}
          className="relative block w-full aspect-[16/10] overflow-hidden rounded-2xl bg-gray-100 cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] focus-visible:ring-offset-2"
          aria-label="Open photo gallery"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[active].url}
            alt={images[active].alt}
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/55 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <Expand size={13} /> View
          </span>
        </button>

        {/* Badges */}
        {badges && <div className="absolute top-3 left-3 flex gap-2">{badges}</div>}

        {/* Counter */}
        {count > 1 && (
          <span className="absolute top-3 right-3 bg-black/55 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full">
            {active + 1} / {count}
          </span>
        )}

        {/* Arrows */}
        {count > 1 && (
          <>
            <GalleryArrow side="left" onClick={() => go(-1)} />
            <GalleryArrow side="right" onClick={() => go(1)} />
          </>
        )}
      </div>

      {/* ── Thumbnails ──────────────────────────────────────────── */}
      {count > 1 && (
        <div className="mt-3 flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
          {images.map((img, i) => (
            <button
              key={img.url}
              type="button"
              onClick={() => setActive(i)}
              className={`relative flex-shrink-0 w-20 h-16 sm:w-24 sm:h-[68px] rounded-lg overflow-hidden transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] focus-visible:ring-offset-1 ${
                i === active
                  ? "ring-2 ring-[var(--color-gold)] ring-offset-2"
                  : "opacity-65 hover:opacity-100"
              }`}
              aria-label={`Show photo ${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={img.alt} loading="lazy" decoding="async" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* ── Lightbox ────────────────────────────────────────────── */}
      {lightbox && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={`Photo ${active + 1} of ${count}`}
          className="fixed inset-0 z-[100] bg-black/92 flex items-center justify-center"
          onClick={() => setLightbox(false)}
        >
          <button
            ref={closeBtnRef}
            type="button"
            onClick={() => setLightbox(false)}
            className="absolute top-5 right-5 text-white/80 hover:text-white p-2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Close gallery"
          >
            <X size={28} />
          </button>

          <span className="absolute top-6 left-6 text-white/70 text-sm font-medium">
            {active + 1} / {count}
          </span>

          {count > 1 && (
            <>
              <GalleryArrow side="left" inLightbox onClick={(e) => { e?.stopPropagation(); go(-1); }} />
              <GalleryArrow side="right" inLightbox onClick={(e) => { e?.stopPropagation(); go(1); }} />
            </>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[active].url}
            alt={images[active].alt}
            decoding="async"
            className="max-h-[88vh] max-w-[92vw] object-contain select-none"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

function GalleryArrow({
  side,
  onClick,
  inLightbox = false,
}: {
  side: "left" | "right";
  onClick: (e?: React.MouseEvent) => void;
  inLightbox?: boolean;
}) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Previous photo" : "Next photo"}
      className={`absolute top-1/2 -translate-y-1/2 focus-visible:outline-none ${side === "left" ? "left-3" : "right-3"} ${
        inLightbox
          ? "text-white/80 hover:text-white p-2 sm:p-3 rounded-full focus-visible:ring-2 focus-visible:ring-white"
          : "bg-white/85 hover:bg-white text-[var(--color-brand)] w-9 h-9 rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity focus-visible:ring-2 focus-visible:ring-[var(--color-brand)]"
      }`}
    >
      <Icon size={inLightbox ? 40 : 20} />
    </button>
  );
}
