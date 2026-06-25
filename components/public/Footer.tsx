import Link from "next/link";

const QUICK_LINKS = [
  { href: "/properties", label: "Buy Property" },
  { href: "/properties?type=rent", label: "Rent Property" },
  { href: "/contact", label: "Sell Property" },
  { href: "/contact", label: "Contact Us" },
];

export function Footer() {
  return (
    <footer className="bg-[var(--color-brand)] text-white">
      {/* Divider */}
      <div className="h-px bg-[var(--color-gold)]/30" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-full bg-[var(--color-gold)] flex items-center justify-center font-bold text-[var(--color-brand)] text-xl">G</div>
              <div>
                <p className="font-bold text-sm tracking-[0.18em] uppercase leading-tight">Gravodaya</p>
                <p className="text-[var(--color-gold)] text-[9px] tracking-[0.22em] uppercase">Developers Pvt. Ltd.</p>
              </div>
            </div>
            <p className="text-white/55 text-sm leading-relaxed max-w-xs">
              Your trusted real estate partner in Uttarakhand — helping families find their dream homes since 2008.
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
                <span>Race Course Road, Dehradun,<br />Uttarakhand — 248001</span>
              </li>
              <li>
                <a href="tel:+919876543210" className="flex items-center gap-2.5 hover:text-[var(--color-gold)] transition-colors">
                  <span>📞</span> +91 98765 43210
                </a>
              </li>
              <li>
                <a href="mailto:info@gravodaya.com" className="flex items-center gap-2.5 hover:text-[var(--color-gold)] transition-colors">
                  <span>✉️</span> info@gravodaya.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-white/35 text-xs">
          <p>© {new Date().getFullYear()} Gravodaya Developers Pvt. Ltd. All rights reserved.</p>
          <p>RERA Registered · Dehradun, Uttarakhand</p>
        </div>
      </div>
    </footer>
  );
}
