"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X, Phone } from "lucide-react";

const NAV_LINKS = [
  { href: "/projects", label: "Projects" },
  { href: "/properties", label: "Properties" },
  { href: "/sell", label: "Sell" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

interface Props {
  phoneTel: string;
  phoneDisplay: string;
}

export function Navbar({ phoneTel, phoneDisplay }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[var(--color-brand)] shadow-lg">
      <nav className="w-full px-5 sm:px-8 lg:px-12 h-16 sm:h-20 flex items-center justify-between gap-4">
        {/* Logo — pinned top-left */}
        <Link href="/" className="group flex items-center gap-2.5 shrink-0" onClick={() => setOpen(false)}>
          {/* logo.png is mostly transparent padding (the emblem is ~40% of its
              height), so it's drawn at full size inside a tight clipping box —
              the emblem keeps its size without the padding setting the bar height. */}
          <span className="flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 overflow-hidden shrink-0">
            <Image
              src="/logo.png"
              alt="Garvoday Developers logo"
              width={144}
              height={96}
              priority
              className="brand-logo h-20 sm:h-24 w-auto max-w-none object-contain select-none shrink-0"
            />
          </span>
          <div>
            <p className="text-white font-bold text-base sm:text-lg tracking-[0.18em] uppercase leading-tight">Garvoday</p>
            <p className="text-[var(--color-gold)] text-[11px] font-extrabold tracking-[0.22em] uppercase">Realty</p>
          </div>
        </Link>

        {/* Desktop nav — links + CTA pinned top-right */}
        <div className="hidden md:flex items-center gap-5 lg:gap-7">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href}
              className="text-white/75 hover:text-white text-xs lg:text-sm font-medium tracking-wide transition-colors whitespace-nowrap">
              {l.label}
            </Link>
          ))}
          <a
            href={`tel:${phoneTel}`}
            className="flex items-center gap-2 bg-[var(--color-gold)] text-white px-4 lg:px-5 py-2.5 rounded-full text-xs lg:text-sm font-bold hover:bg-[var(--color-gold-light)] transition-colors shadow-sm whitespace-nowrap"
          >
            <Phone size={14} />
            {phoneDisplay}
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="md:hidden text-white p-1.5 -mr-1"
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden bg-[var(--color-brand-light)] border-t border-white/10 px-5 py-5 space-y-1">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              className="block text-white/85 hover:text-white py-3 text-base font-medium border-b border-white/10">
              {l.label}
            </Link>
          ))}
          <div className="pt-4">
            <a
              href={`tel:${phoneTel}`}
              className="flex items-center justify-center gap-2 bg-[var(--color-gold)] text-[var(--color-brand)] px-5 py-3 rounded-full text-sm font-bold w-full"
            >
              <Phone size={15} />
              Call Us: {phoneDisplay}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
