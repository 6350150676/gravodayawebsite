import type { Metadata } from "next";
import Link from "next/link";
import { Phone } from "lucide-react";
import { getFeaturedProperties } from "@/lib/queries/properties";
import { PropertyCard } from "@/components/public/PropertyCard";

export const metadata: Metadata = {
  title: "Gravodaya Developers — Premium Properties in Uttarakhand",
  description:
    "Find premium apartments, villas, plots and commercial spaces in Dehradun, Haridwar and Rishikesh. Trusted by 500+ families across Uttarakhand.",
};

const INTENT_CARDS = [
  {
    href: "/properties",
    icon: (
      <svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
    label: "Buy a Home",
    sublabel: "Own your dream property",
    description: "Browse apartments, villas, plots & more for sale across Dehradun, Haridwar and Rishikesh.",
    cta: "Explore for Sale →",
    accent: "var(--color-brand)",
  },
  {
    href: "/properties?type=rent",
    icon: (
      <svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
      </svg>
    ),
    label: "Rent a Property",
    sublabel: "Comfortable living spaces",
    description: "Find fully furnished or semi-furnished homes & offices at fair monthly rentals.",
    cta: "Browse Rentals →",
    accent: "var(--color-gold)",
  },
  {
    href: "/contact",
    icon: (
      <svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
      </svg>
    ),
    label: "Sell Your Property",
    sublabel: "Get the best value",
    description: "List with us and reach thousands of qualified buyers. Free valuation & assistance.",
    cta: "Get Free Valuation →",
    accent: "#16a34a",
  },
];

const STATS = [
  { value: "15+", label: "Years of Experience" },
  { value: "500+", label: "Happy Families" },
  { value: "3", label: "Prime Locations" },
  { value: "100%", label: "Transparency" },
];

const WHY_US = [
  "RERA registered & legally compliant properties",
  "Dedicated relationship manager for every buyer",
  "Transparent pricing — no hidden charges",
  "Expert knowledge of Dehradun, Haridwar & Rishikesh markets",
  "End-to-end support from search to registration",
  "Trusted by 500+ families across Uttarakhand",
];

export default async function HomePage() {
  const featured = await getFeaturedProperties(6);
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

  return (
    <div className="bg-[#f8f9fb]">

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative bg-[var(--color-brand)] overflow-hidden">
        {/* Decorative background shapes */}
        <div className="absolute inset-0 pointer-events-none select-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/[0.03]" />
          <div className="absolute bottom-0 -left-16 w-72 h-72 rounded-full bg-white/[0.03]" />
          <div className="absolute top-1/2 left-1/3 w-[500px] h-[500px] rounded-full bg-[var(--color-gold)]/[0.04] -translate-y-1/2" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36 text-center">
          {/* Tag line */}
          <div className="inline-flex items-center gap-2 bg-[var(--color-gold)]/15 border border-[var(--color-gold)]/30 text-[var(--color-gold)] text-xs font-semibold tracking-[0.2em] uppercase px-4 py-2 rounded-full mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-gold)] inline-block" />
            Uttarakhand's Most Trusted Real Estate
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight max-w-4xl mx-auto">
            Your Dream Home,{" "}
            <span className="text-[var(--color-gold)]">Nestled in<br className="hidden sm:block" /> the Himalayas</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-white/65 max-w-2xl mx-auto leading-relaxed">
            Premium apartments, villas, plots and commercial spaces in<br className="hidden sm:block" />
            <strong className="text-white/80 font-medium">Dehradun · Haridwar · Rishikesh</strong>
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/properties"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[var(--color-gold)] text-[var(--color-brand)] font-bold text-base px-8 py-4 rounded-full hover:bg-[var(--color-gold-light)] transition-colors shadow-lg shadow-black/20"
            >
              Explore Properties
            </Link>
            <Link
              href="/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white font-semibold text-base px-8 py-4 rounded-full hover:bg-white/10 transition-colors"
            >
              Sell / List Your Property
            </Link>
          </div>

          {/* Trust strip */}
          <div className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-white/45 text-sm">
            <span>✓ RERA Registered</span>
            <span className="hidden sm:inline">·</span>
            <span>✓ 15+ Years in Business</span>
            <span className="hidden sm:inline">·</span>
            <span>✓ 500+ Happy Families</span>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60L1440 60L1440 20C1200 60 960 0 720 20C480 40 240 0 0 20L0 60Z" fill="#f8f9fb" />
          </svg>
        </div>
      </section>

      {/* ── WHAT ARE YOU LOOKING FOR ─────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
        <div className="text-center mb-12">
          <p className="text-[var(--color-gold)] text-xs font-bold tracking-[0.22em] uppercase mb-3">How Can We Help?</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-brand)]">What Are You Looking For?</h2>
          <div className="mt-3 mx-auto w-16 h-1 bg-[var(--color-gold)] rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {INTENT_CARDS.map((card) => (
            <Link
              key={card.href + card.label}
              href={card.href}
              className="group relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl border border-gray-100 hover:border-[var(--color-gold)]/30 transition-all duration-300 overflow-hidden"
            >
              {/* Top accent bar */}
              <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl transition-all duration-300"
                style={{ backgroundColor: card.accent }} />

              {/* Icon */}
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
                style={{ backgroundColor: `${card.accent}15`, color: card.accent }}>
                {card.icon}
              </div>

              <p className="text-xs font-bold tracking-[0.18em] uppercase mb-1" style={{ color: card.accent }}>
                {card.sublabel}
              </p>
              <h3 className="text-2xl font-bold text-[var(--color-brand)] mb-3">{card.label}</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">{card.description}</p>

              <span className="text-sm font-semibold inline-flex items-center gap-1 transition-colors"
                style={{ color: card.accent }}>
                {card.cta}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── STATS ───────────────────────────────────────────────────── */}
      <section className="bg-[var(--color-brand)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="text-4xl sm:text-5xl font-bold text-[var(--color-gold)]">{s.value}</p>
                <p className="mt-2 text-white/60 text-sm font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PROPERTIES ─────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <p className="text-[var(--color-gold)] text-xs font-bold tracking-[0.22em] uppercase mb-3">Handpicked for You</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-brand)]">Featured Properties</h2>
              <div className="mt-3 w-16 h-1 bg-[var(--color-gold)] rounded-full" />
            </div>
            <Link href="/properties" className="text-sm font-semibold text-[var(--color-brand)] hover:text-[var(--color-gold)] transition-colors whitespace-nowrap">
              View All Properties →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((p) => (
              <PropertyCard key={p.id} property={p} supabaseUrl={supabaseUrl} />
            ))}
          </div>
        </section>
      )}

      {/* ── WHY GRAVODAYA ───────────────────────────────────────── */}
      <section className="bg-white border-t border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

            {/* Left text */}
            <div>
              <p className="text-[var(--color-gold)] text-xs font-bold tracking-[0.22em] uppercase mb-3">Why Choose Us</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-brand)] leading-snug mb-4">
                Gravodaya — Where Trust<br />Meets Real Estate
              </h2>
              <p className="text-gray-500 leading-relaxed mb-8">
                With over 15 years of experience serving families across Uttarakhand, we understand that buying or renting a home is one of the most important decisions of your life. We are here to make it simple, transparent, and joyful.
              </p>

              <ul className="space-y-3">
                {WHY_US.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--color-gold)]/15 flex items-center justify-center mt-0.5">
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="var(--color-gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span className="text-gray-600 text-sm leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: visual card */}
            <div className="relative">
              <div className="bg-[var(--color-brand)] rounded-3xl p-8 sm:p-10 text-white">
                <p className="text-[var(--color-gold)] text-xs font-bold tracking-[0.2em] uppercase mb-6">Serving Three Sacred Cities</p>
                {[
                  { city: "Dehradun", note: "Capital City · Gateway to the Hills" },
                  { city: "Haridwar", note: "Spiritual Hub · High Rental Demand" },
                  { city: "Rishikesh", note: "Scenic Beauty · Premium Retreats" },
                ].map((loc, i) => (
                  <div key={loc.city} className={`flex items-start gap-4 ${i < 2 ? "mb-6 pb-6 border-b border-white/10" : ""}`}>
                    <div className="w-10 h-10 rounded-full bg-[var(--color-gold)]/20 flex-shrink-0 flex items-center justify-center text-[var(--color-gold)] font-bold text-sm">
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-base">{loc.city}</p>
                      <p className="text-white/50 text-xs mt-0.5">{loc.note}</p>
                    </div>
                  </div>
                ))}

                <div className="mt-8 pt-6 border-t border-white/10">
                  <a href="tel:+919876543210"
                    className="flex items-center justify-center gap-3 bg-[var(--color-gold)] text-[var(--color-brand)] font-bold py-3.5 rounded-xl hover:bg-[var(--color-gold-light)] transition-colors">
                    <Phone size={16} />
                    Call for Free Consultation
                  </a>
                </div>
              </div>

              {/* Decorative dot */}
              <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-[var(--color-gold)]/10 -z-10" />
              <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-[var(--color-brand)]/10 -z-10" />
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ─────────────────────────────────────────── */}
      <section className="bg-[var(--color-gold)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-brand)] mb-3">
            Ready to Find Your Perfect Home?
          </h2>
          <p className="text-[var(--color-brand)]/70 mb-8 text-base">
            Talk to our experts today — free consultation, no obligations.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="tel:+919876543210"
              className="inline-flex items-center gap-2 bg-[var(--color-brand)] text-white font-bold px-8 py-4 rounded-full hover:bg-[var(--color-brand-light)] transition-colors shadow-md"
            >
              <Phone size={16} />
              +91 98765 43210
            </a>
            <Link
              href="/properties"
              className="inline-flex items-center gap-2 bg-white text-[var(--color-brand)] font-bold px-8 py-4 rounded-full hover:bg-gray-50 transition-colors shadow-md"
            >
              Browse Properties
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
