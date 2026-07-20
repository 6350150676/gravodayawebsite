"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { HeroSlide } from "@/types";

interface Props {
  slides: HeroSlide[];
  children?: React.ReactNode;
  interval?: number;
}

// last word gets the gold highlight
function splitLastWord(title: string): [string, string] {
  const words = title.trim().split(/\s+/);
  if (words.length <= 1) return ["", title];
  const last = words.pop()!;
  return [words.join(" "), last];
}

export function HeroCarousel({ slides, children, interval = 6000 }: Props) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(() => {
      setActive((i) => (i + 1) % slides.length);
    }, interval);
    return () => clearInterval(id);
  }, [slides.length, interval]);

  const slide = slides[active];
  const [titleHead, titleTail] = splitLastWord(slide.title);

  return (
    <section className="relative min-h-[88vh] flex items-center overflow-hidden">
      {/* Background photos — crossfade */}
      {slides.map((s, i) => (
        <Image
          key={s.image_url + i}
          src={s.image_url}
          alt=""
          fill
          priority={i === 0}
          className={`object-cover object-center transition-opacity duration-1000 ease-in-out ${
            i === active ? "opacity-100" : "opacity-0"
          }`}
          sizes="100vw"
        />
      ))}

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#1E3A34]/90 via-[#1E3A34]/75 to-[#1E3A34]/40" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
        <div className="max-w-3xl">
          {slide.badge && (
            <div className="inline-flex items-center gap-2 bg-[var(--color-gold)]/20 border border-[var(--color-gold)]/40 text-[var(--color-gold)] text-xs font-semibold tracking-[0.2em] uppercase px-4 py-2 rounded-full mb-6 transition-all duration-500">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-gold)]" />
              {slide.badge}
            </div>
          )}

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight transition-all duration-500">
            {titleHead}{titleHead && " "}
            <span className="text-[var(--color-gold)]">{titleTail}</span>
          </h1>

          {slide.subtitle && (
            <p className="mt-5 text-lg text-white/70 leading-relaxed max-w-xl whitespace-pre-line transition-all duration-500">
              {slide.subtitle}
            </p>
          )}

          {children}
        </div>
      </div>

      {/* Slide indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === active ? "w-8 bg-[var(--color-gold)]" : "w-1.5 bg-white/40 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      )}

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <svg viewBox="0 0 1440 70" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 70L1440 70L1440 25C1200 70 960 5 720 25C480 50 240 5 0 25Z" fill="#F7F3EC" />
        </svg>
      </div>
    </section>
  );
}
