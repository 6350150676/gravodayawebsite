import Link from "next/link";
import Image from "next/image";
import { Instagram } from "lucide-react";

const SOCIAL_LINKS = [
  {
    href: "https://www.instagram.com/garvodaydevelopers?igsh=MThlMzg4ZHFyZWNqbQ==",
    label: "Instagram",
    icon: Instagram,
  },
  {
    href: "https://x.com/garvodaydevelop?s=11",
    label: "X (Twitter)",
    icon: null,
  },
];

const QUICK_LINKS = [
  { href: "/properties", label: "Buy Property" },
  { href: "/projects", label: "Our Projects" },
  { href: "/contact", label: "Sell Property" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact Us" },
];

interface Props {
  phoneTel: string;
  phoneDisplay: string;
  email: string;
  address: string;
}

export function Footer({ phoneTel, phoneDisplay, email, address }: Props) {
  return (
    <footer className="bg-[var(--color-brand)] text-white">
      {/* Divider */}
      <div className="h-px bg-[var(--color-gold)]/30" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">

          {/* Brand */}
          <div>
            <div className="group flex items-center gap-3 mb-5">
              <Image
                src="/logo.png"
                alt="Garvoday Developers logo"
                width={96}
                height={64}
                className="brand-logo h-16 w-auto object-contain flex-shrink-0"
              />
              <div>
                <p className="font-bold text-base tracking-[0.18em] uppercase leading-tight">Garvoday</p>
                <p className="text-[var(--color-gold)] text-[11px] font-extrabold tracking-[0.22em] uppercase">Realty</p>
              </div>
            </div>
            <p className="text-white/55 text-sm leading-relaxed max-w-xs">
              Your trusted real estate partner in Haridwar — helping families find their dream homes.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-[var(--color-gold)] font-semibold text-xs uppercase tracking-[0.18em] mb-5">Quick Links</h3>
            <ul className="space-y-3">
              {QUICK_LINKS.map((l) => (
                <li key={l.href + l.label}>
                  <Link href={l.href} className="text-white/60 hover:text-[var(--color-gold)] text-sm transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-[var(--color-gold)] font-semibold text-xs uppercase tracking-[0.18em] mb-5">Get In Touch</h3>
            <ul className="space-y-3 text-sm text-white/60">
              <li className="flex items-start gap-2.5">
                <span className="mt-0.5 flex-shrink-0">📍</span>
                <span>{address}</span>
              </li>
              <li>
                <a href={`tel:${phoneTel}`} className="flex items-center gap-2.5 hover:text-[var(--color-gold)] transition-colors">
                  <span>📞</span> {phoneDisplay}
                </a>
              </li>
              <li>
                <a href={`mailto:${email}`} className="flex items-center gap-2.5 hover:text-[var(--color-gold)] transition-colors">
                  <span>✉️</span> {email}
                </a>
              </li>
            </ul>

            <h3 className="text-[var(--color-gold)] font-semibold text-xs uppercase tracking-[0.18em] mt-8 mb-4">Follow Us</h3>
            <div className="flex items-center gap-3">
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.href}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-white/20 text-white/60 hover:text-[var(--color-gold)] hover:border-[var(--color-gold)] transition-colors"
                >
                  {s.icon ? (
                    <s.icon size={16} />
                  ) : (
                    <svg viewBox="0 0 24 24" width={14} height={14} fill="currentColor" aria-hidden="true">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  )}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-white/35 text-xs">
          <p>© {new Date().getFullYear()} Garvoday Developers Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-[var(--color-gold)] transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-[var(--color-gold)] transition-colors">Terms of Service</Link>
            <p>RERA Registered · Haridwar, Uttarakhand</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
