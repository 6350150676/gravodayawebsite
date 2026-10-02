"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { HeroSlide } from "@/types";

interface Props {
  slides: HeroSlide[];
  children?: React.ReactNode;
  interval?: number;
}

// last word gets the italic terracotta accent
function splitLastWord(title: string): [string, string] {
  const words = title.trim().split(/\s+/);
  if (words.length <= 1) return ["", title];
  const last = words.pop()!;
  return [words.join(" "), last];
}

const pad = (n: number) => String(n).padStart(2, "0");

export function HeroCarousel({ slides, children, interval = 7000 }: Props) {
  const [active, setActive] = useState(0);
  // The first photo paints at rest and only starts its slow zoom once we're
  // hydrated, so the LCP image is never waiting on JS.
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => setZoomed(true), []);

  // A timeout keyed on `active` (not a free-running interval) so a manual pick
  // restarts the clock and the progress line stays in step with it.
  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setTimeout(() => setActive((i) => (i + 1) % slides.length), interval);
    return () => clearTimeout(id);
  }, [active, slides.length, interval]);

  const slide = slides[active];
  const [titleHead, titleTail] = splitLastWord(slide.title);

  return (
    <section className="relative isolate flex min-h-[calc(100svh-4rem)] sm:min-h-[calc(100svh-5rem)] items-end overflow-hidden bg-(--color-forest) text-white">
      {/* Background photos — crossfade + slow push-out */}
      {slides.map((s, i) => (
        <div
          key={s.image_url + i}
          aria-hidden="true"
          className={`hero-slide absolute inset-0 -z-20 ${i === active ? "is-active" : ""} ${zoomed ? "is-zoomed" : ""}`}
        >
          <Image
            src={s.image_url}
            alt=""
            fill
            priority={i === 0}
            className="object-cover object-center"
            sizes="100vw"
          />
        </div>
      ))}

      {/* Tint: brand green from the left for the copy, a low vignette for depth */}
      <div className="absolute inset-0 -z-10 bg-linear-to-r from-(--color-forest)/90 via-(--color-forest)/65 to-(--color-forest)/10" />
      <div className="absolute inset-0 -z-10 bg-linear-to-t from-black/60 via-black/5 to-black/35" />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-24 lg:pb-28">
        {/* Keyed on the slide so the copy re-enters with each change */}
        <div key={active} className="max-w-4xl">
          {slide.badge && (
            <p className="hero-rise flex items-center gap-4 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.22em] sm:tracking-[0.32em] text-white/80">
              <span className="h-px w-10 bg-(--color-terracotta-light)" />
              {slide.badge}
            </p>
          )}

          <h1
            className="hero-rise mt-6 font-display font-medium text-[2.85rem] leading-[1.02] sm:text-7xl lg:text-[5.75rem] tracking-[-0.01em] text-balance"
            style={{ animationDelay: "120ms" }}
          >
            {titleHead}
            {titleHead && " "}
            <em className="font-normal text-(--color-terracotta-light)">{titleTail}</em>
          </h1>

          {slide.subtitle && (
            <p
              className="hero-rise mt-6 max-w-xl text-base sm:text-lg text-white/75 leading-relaxed whitespace-pre-line"
              style={{ animationDelay: "240ms" }}
            >
              {slide.subtitle}
            </p>
          )}
        </div>

        <div className="mt-10 sm:mt-12 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="w-full max-w-4xl">{children}</div>

          {/* Slide counter — 01 ── ── ── 04 */}
          {slides.length > 1 && (
            <div className="hidden sm:flex items-center gap-4 shrink-0">
              <span className="font-display text-2xl leading-none text-white">{pad(active + 1)}</span>
              <div className="flex items-center gap-1.5">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActive(i)}
                    aria-label={`Show slide ${i + 1}`}
                    aria-current={i === active}
                    className="group relative h-6 w-8 sm:w-10"
                  >
                    <span className="absolute inset-x-0 top-1/2 h-px bg-white/30 transition-colors group-hover:bg-white/60" />
                    {i === active ? (
                      <span
                        key={active}
                        className="hero-progress absolute inset-x-0 top-1/2 h-px bg-white"
                        style={{ animationDuration: `${interval}ms` }}
                      />
                    ) : null}
                  </button>
                ))}
              </div>
              <span className="font-display text-base leading-none text-white/50">{pad(slides.length)}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
