"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X, Phone } from "lucide-react";

const NAV_LINKS = [
  { href: "/projects", label: "Projects" },
  { href: "/properties", label: "Properties" },
  { href: "/properties?type=rent", label: "Rentals" },
  { href: "/sell", label: "List Property" },
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
      <nav className="w-full px-5 sm:px-8 lg:px-12 h-28 flex items-center justify-between gap-4">
        {/* Logo — pinned top-left */}
        <Link href="/" className="group flex items-center gap-0 shrink-0" onClick={() => setOpen(false)}>
          <Image
            src="/logo.png"
            alt="Garvoday Developers logo"
            width={96}
            height={64}
            priority
            className="brand-logo h-24 w-auto object-contain select-none flex-shrink-0"
          />
          <div className="-ml-8">
            <p className="text-white font-bold text-base sm:text-lg tracking-[0.18em] uppercase leading-tight">Garvoday</p>
            <p className="text-[var(--color-gold)] text-[10px] tracking-[0.22em] uppercase">Developers Pvt. Ltd.</p>
          </div>
        </Link>

        {/* Desktop nav — links + CTA pinned top-right */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href}
              className="text-white/75 hover:text-white text-sm font-medium tracking-wide transition-colors">
              {l.label}
            </Link>
          ))}
          <a
            href={`tel:${phoneTel}`}
            className="flex items-center gap-2 bg-[var(--color-gold)] text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-[var(--color-gold-light)] transition-colors shadow-sm"
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
