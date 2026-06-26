"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X, Phone } from "lucide-react";

const NAV_LINKS = [
  { href: "/properties", label: "Properties" },
  { href: "/properties?type=rent", label: "Rentals" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[var(--color-brand)] shadow-lg">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 flex-shrink-0" onClick={() => setOpen(false)}>
          <Image
            src="/logo-gold.png"
            alt="Gravodaya Developers logo"
            width={56}
            height={56}
            priority
            className="h-12 w-auto object-contain select-none flex-shrink-0"
          />
          <div>
            <p className="text-white font-bold text-sm tracking-[0.18em] uppercase leading-tight">Gravodaya</p>
            <p className="text-[var(--color-gold)] text-[9px] tracking-[0.22em] uppercase">Developers Pvt. Ltd.</p>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href}
              className="text-white/75 hover:text-white text-sm font-medium transition-colors">
              {l.label}
            </Link>
          ))}
          <a
            href="tel:+919876543210"
            className="flex items-center gap-2 bg-[var(--color-gold)] text-[var(--color-brand)] px-4 py-2 rounded-full text-sm font-bold hover:bg-[var(--color-gold-light)] transition-colors"
          >
            <Phone size={13} />
            +91 98765 43210
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="md:hidden text-white p-1.5 -mr-1"
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
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
              href="tel:+919876543210"
              className="flex items-center justify-center gap-2 bg-[var(--color-gold)] text-[var(--color-brand)] px-5 py-3 rounded-full text-sm font-bold w-full"
            >
              <Phone size={15} />
              Call Us: +91 98765 43210
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
