import Link from "next/link";
import Image from "next/image";

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} aria-hidden="true">
      <defs>
        <radialGradient id="ig-gradient" cx="30%" cy="107%" r="150%">
          <stop offset="0%" stopColor="#fdf497" />
          <stop offset="5%" stopColor="#fdf497" />
          <stop offset="45%" stopColor="#fd5949" />
          <stop offset="60%" stopColor="#d6249f" />
          <stop offset="90%" stopColor="#285AEB" />
        </radialGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="5" fill="url(#ig-gradient)" />
      <path
        d="M12 7.4a4.6 4.6 0 1 0 0 9.2 4.6 4.6 0 0 0 0-9.2zm0 7.6a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"
        fill="#fff"
      />
      <circle cx="16.8" cy="7.2" r="1.1" fill="#fff" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" width={20} height={20} aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" fill="#000" />
      <path
        d="M13.6 11.1 18.24 6h-1.1l-4.03 4.43L9.9 6H6.2l4.87 6.68L6.2 18h1.1l4.26-4.68L14.8 18h3.7l-4.9-6.9zm-1.51 1.66-.49-.68L7.68 6.8h1.7l3.16 4.36.49.68 4.11 5.66h-1.7l-3.35-4.62z"
        fill="#fff"
      />
    </svg>
  );
}

const SOCIAL_LINKS = [
  {
    href: "https://www.instagram.com/garvodaydevelopers?igsh=MThlMzg4ZHFyZWNqbQ==",
    label: "Instagram",
    Icon: InstagramIcon,
  },
  {
    href: "https://x.com/garvodaydevelop?s=11",
    label: "X (Twitter)",
    Icon: XIcon,
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
                  className="w-9 h-9 flex items-center justify-center rounded-full overflow-hidden hover:opacity-80 hover:-translate-y-0.5 transition-all"
                >
                  <s.Icon />
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
