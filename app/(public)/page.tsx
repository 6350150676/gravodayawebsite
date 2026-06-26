import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Phone, Building2, Home, Map, Store, Trees, ArrowRight } from "lucide-react";
import { getFeaturedProperties, getCategories, getCities } from "@/lib/queries/properties";
import { PropertyCard } from "@/components/public/PropertyCard";
import { HeroSearch } from "@/components/public/HeroSearch";
import { Reveal } from "@/components/public/Reveal";
import { CountUp } from "@/components/public/CountUp";

export const metadata: Metadata = {
  title: "Gravodaya Developers — Premium Properties in Uttarakhand",
  description:
    "Find premium apartments, villas, plots and commercial spaces in Dehradun, Haridwar and Rishikesh. Trusted by 500+ families across Uttarakhand.",
};

/* ─── image URLs ─────────────────────────────────────────────────────────── */
const IMG = {
  hero:   "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1800&q=85&auto=format&fit=crop",
  buy:    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80&auto=format&fit=crop",
  rent:   "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80&auto=format&fit=crop",
  sell:   "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80&auto=format&fit=crop",
  ddn:    "https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=800&q=80&auto=format&fit=crop",
  hdw:    "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80&auto=format&fit=crop",
  rksh:   "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80&auto=format&fit=crop",
  whyUs:  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=900&q=80&auto=format&fit=crop",
};

/* ─── data ───────────────────────────────────────────────────────────────── */
const INTENT_CARDS = [
  {
    href: "/properties",
    img: IMG.buy,
    imgAlt: "Beautiful home for sale",
    label: "Buy a Home",
    sublabel: "Own your dream property",
    description: "Browse apartments, villas, plots & more for sale across Dehradun, Haridwar and Rishikesh.",
    cta: "Explore for Sale →",
    accent: "var(--color-brand)",
  },
  {
    href: "/properties?type=rent",
    img: IMG.rent,
    imgAlt: "Modern apartment interior",
    label: "Rent a Property",
    sublabel: "Comfortable living spaces",
    description: "Find fully furnished or semi-furnished homes & offices at fair monthly rentals.",
    cta: "Browse Rentals →",
    accent: "var(--color-gold)",
  },
  {
    href: "/contact",
    img: IMG.sell,
    imgAlt: "Sell your property",
    label: "Sell Your Property",
    sublabel: "Get the best value",
    description: "List with us and reach thousands of qualified buyers. Free valuation & expert assistance.",
    cta: "Get Free Valuation →",
    accent: "var(--color-moss)",
  },
];

const STATS = [
  { value: 15,  suffix: "+", label: "Years of Experience" },
  { value: 500, suffix: "+", label: "Happy Families" },
  { value: 3,   suffix: "",  label: "Prime Locations" },
  { value: 100, suffix: "%", label: "Transparency" },
];

const CITIES = [
  { name: "Dehradun", note: "Capital City · Gateway to the Hills", img: IMG.ddn },
  { name: "Haridwar", note: "Spiritual Hub · High Rental Demand",  img: IMG.hdw },
  { name: "Rishikesh", note: "Scenic Beauty · Premium Retreats",   img: IMG.rksh },
];

const WHY_US = [
  "RERA registered & legally compliant properties",
  "Dedicated relationship manager for every buyer",
  "Transparent pricing — no hidden charges",
  "Expert knowledge of Dehradun, Haridwar & Rishikesh markets",
  "End-to-end support from search to registration",
  "Trusted by 500+ families across Uttarakhand",
];

/* Map a category name to a representative icon for the quick-links strip */
function categoryIcon(name: string) {
  const n = name.toLowerCase();
  if (/villa|house|independent|bungalow|duplex/.test(n)) return Home;
  if (/plot|land/.test(n)) return Map;
  if (/commercial|office|shop|retail|showroom/.test(n)) return Store;
  if (/farm|resort|retreat|cottage/.test(n)) return Trees;
  return Building2; // apartments / flats / default
}

/* ─── page ───────────────────────────────────────────────────────────────── */
export default async function HomePage() {
  const [featured, categories, cities] = await Promise.all([
    getFeaturedProperties(6),
    getCategories(),
    getCities(),
  ]);
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

  return (
    <div className="bg-[var(--color-sand)]">

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section className="relative min-h-[88vh] flex items-center overflow-hidden">

        {/* Background photo */}
        <Image
          src={IMG.hero}
          alt="Luxury home"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />

        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1E3A34]/90 via-[#1E3A34]/75 to-[#1E3A34]/40" />

        {/* Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
          <div className="max-w-3xl">

            <div className="inline-flex items-center gap-2 bg-[var(--color-gold)]/20 border border-[var(--color-gold)]/40 text-[var(--color-gold)] text-xs font-semibold tracking-[0.2em] uppercase px-4 py-2 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-gold)]" />
              Uttarakhand's Most Trusted Real Estate
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Find Your Dream Home in the{" "}
              <span className="text-[var(--color-gold)]">Himalayas</span>
            </h1>

            <p className="mt-5 text-lg text-white/70 leading-relaxed max-w-xl">
              Apartments, villas, plots &amp; commercial spaces across{" "}
              <span className="text-white font-medium">Dehradun · Haridwar · Rishikesh</span>
            </p>

            {/* Search widget */}
            <div className="mt-8">
              <HeroSearch cities={cities} categories={categories} />
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-white/55 text-sm">
              <span>✓ RERA Registered</span>
              <span>✓ 15+ Years in Business</span>
              <span>✓ 500+ Happy Families</span>
              <Link href="/contact" className="text-[var(--color-gold)] font-semibold hover:underline">
                List your property →
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <svg viewBox="0 0 1440 70" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 70L1440 70L1440 25C1200 70 960 5 720 25C480 50 240 5 0 25Z" fill="#F7F3EC" />
          </svg>
        </div>
      </section>

      {/* ── BROWSE BY PROPERTY TYPE ──────────────────────────────── */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-2">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-[var(--color-gold)] text-xs font-bold tracking-[0.22em] uppercase mb-2">Browse by Type</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-brand)]">Explore Property Types</h2>
            </div>
            <Link href="/properties" className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-brand)] hover:text-[var(--color-gold)] transition-colors">
              View all <ArrowRight size={15} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {categories.map((c) => {
              const Icon = categoryIcon(c.name);
              return (
                <Link
                  key={c.id}
                  href={`/properties?category=${c.id}`}
                  className="group flex flex-col items-center text-center gap-3 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-[var(--color-gold)]/40 hover:-translate-y-1 transition-all duration-300"
                >
                  <span className="flex items-center justify-center w-12 h-12 rounded-full bg-[var(--color-brand)]/5 text-[var(--color-brand)] group-hover:bg-[var(--color-gold)]/15 group-hover:text-[var(--color-gold)] transition-colors">
                    <Icon size={22} />
                  </span>
                  <span className="text-sm font-semibold text-gray-700 group-hover:text-[var(--color-brand)] transition-colors leading-tight">
                    {c.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ── WHAT ARE YOU LOOKING FOR ─────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-20">
        <div className="text-center mb-12">
          <p className="text-[var(--color-gold)] text-xs font-bold tracking-[0.22em] uppercase mb-3">How Can We Help?</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-brand)]">What Are You Looking For?</h2>
          <div className="mt-3 mx-auto w-16 h-1 bg-[var(--color-gold)] rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {INTENT_CARDS.map((card, i) => (
            <Reveal key={card.label} delay={i * 120}>
              <Link href={card.href}
                className="group block h-full bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 hover:border-[var(--color-gold)]/30 hover:-translate-y-1 transition-all duration-300">

                {/* Card photo */}
                <div className="relative h-44 overflow-hidden">
                  <Image src={card.img} alt={card.imgAlt} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width:768px) 100vw, 33vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <span className="absolute bottom-3 left-4 text-white text-xs font-bold tracking-[0.15em] uppercase"
                    style={{ textShadow: "0 1px 4px rgba(0,0,0,.6)" }}>
                    {card.sublabel}
                  </span>
                </div>

                {/* Card text */}
                <div className="p-6">
                  <div className="w-8 h-1 rounded-full mb-4 transition-all duration-300 group-hover:w-12" style={{ backgroundColor: card.accent }} />
                  <h3 className="text-xl font-bold text-[var(--color-brand)] mb-2">{card.label}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-5">{card.description}</p>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold transition-all group-hover:gap-2" style={{ color: card.accent }}>{card.cta}</span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── STATS ───────────────────────────────────────────────── */}
      <section className="bg-[var(--color-brand)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="text-4xl sm:text-5xl font-bold text-[var(--color-gold)]">
                  <CountUp value={s.value} suffix={s.suffix} />
                </p>
                <p className="mt-2 text-white/60 text-sm font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PROPERTIES ────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <p className="text-[var(--color-gold)] text-xs font-bold tracking-[0.22em] uppercase mb-3">Handpicked for You</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-brand)]">Featured Properties</h2>
              <div className="mt-3 w-16 h-1 bg-[var(--color-gold)] rounded-full" />
            </div>
            <Link href="/properties" className="text-sm font-semibold text-[var(--color-brand)] hover:text-[var(--color-gold)] transition-colors">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((p, i) => (
              <Reveal key={p.id} delay={(i % 3) * 110}>
                <PropertyCard property={p} supabaseUrl={supabaseUrl} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ── PRIME LOCATIONS ─────────────────────────────────────── */}
      <section className="bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <p className="text-[var(--color-gold)] text-xs font-bold tracking-[0.22em] uppercase mb-3">Where We Operate</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-brand)]">Prime Locations</h2>
            <div className="mt-3 mx-auto w-16 h-1 bg-[var(--color-gold)] rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {CITIES.map((city, i) => (
              <Reveal key={city.name} delay={i * 120}>
              <Link href={`/properties?city=${city.name.toLowerCase()}`}
                className="group relative block h-72 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
                <Image src={city.img} alt={city.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width:640px) 100vw, 33vw" />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1E3A34]/90 via-[#1E3A34]/30 to-transparent" />
                {/* Text */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="w-8 h-0.5 bg-[var(--color-gold)] mb-3" />
                  <h3 className="text-xl font-bold text-white">{city.name}</h3>
                  <p className="text-white/65 text-xs mt-1">{city.note}</p>
                </div>
              </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY GRAVODAYA ───────────────────────────────────────── */}
      <section className="bg-[var(--color-sand)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left */}
            <Reveal>
              <p className="text-[var(--color-gold)] text-xs font-bold tracking-[0.22em] uppercase mb-3">Why Choose Us</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-brand)] leading-snug mb-4">
                Where Trust Meets<br />Real Estate
              </h2>
              <p className="text-gray-500 leading-relaxed mb-8 text-[15px]">
                With over 15 years serving families across Uttarakhand, we understand that buying or renting a home is one of the most important decisions of your life. We make it simple, transparent, and joyful.
              </p>
              <ul className="space-y-3.5">
                {WHY_US.map((item) => (
                  <li key={item} className="flex items-start gap-3.5">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--color-gold)]/20 flex items-center justify-center mt-0.5">
                      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="var(--color-gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span className="text-gray-600 text-sm leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-10">
                <a href="tel:+919876543210"
                  className="inline-flex items-center gap-2.5 bg-[var(--color-royal)] text-white font-bold px-7 py-3.5 rounded-full hover:bg-[var(--color-royal-dark)] transition-colors shadow-lg">
                  <Phone size={15} /> Call for Free Consultation
                </a>
              </div>
            </Reveal>

            {/* Right: photo */}
            <Reveal delay={150} className="relative">
              <div className="relative h-[480px] rounded-3xl overflow-hidden shadow-2xl">
                <Image src={IMG.whyUs} alt="Beautiful property interior" fill className="object-cover" sizes="(max-width:1024px) 100vw, 50vw" />
                {/* Gold accent card overlay */}
                <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[var(--color-gold)] flex items-center justify-center flex-shrink-0 font-bold text-[var(--color-brand)] text-xl">G</div>
                    <div>
                      <p className="font-bold text-[var(--color-brand)] text-sm">Gravodaya Developers</p>
                      <p className="text-gray-500 text-xs mt-0.5">Trusted Since 2008 · Dehradun</p>
                      <div className="flex gap-0.5 mt-1">
                        {[1,2,3,4,5].map((i) => (
                          <svg key={i} width="12" height="12" viewBox="0 0 20 20" fill="var(--color-gold)">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        <span className="text-xs text-gray-500 ml-1">5.0 (120+ reviews)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* decorative blobs */}
              <div className="absolute -top-5 -right-5 w-28 h-28 rounded-full bg-[var(--color-gold)]/15 -z-10 animate-floaty" />
              <div className="absolute -bottom-5 -left-5 w-20 h-20 rounded-full bg-[var(--color-brand)]/10 -z-10 animate-floaty" />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[var(--color-brand)]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/[0.03]" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-[var(--color-gold)]/[0.07]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <p className="text-[var(--color-gold)] text-xs font-bold tracking-[0.2em] uppercase mb-4">Let's Talk</p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to Find Your Perfect Home?
          </h2>
          <p className="text-white/60 mb-10 text-base max-w-md mx-auto">
            Talk to our experts today — free consultation, zero obligations.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="tel:+919876543210"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[var(--color-gold)] text-[var(--color-brand)] font-bold px-8 py-4 rounded-full hover:bg-[var(--color-gold-light)] transition-colors shadow-lg text-base">
              <Phone size={16} /> +91 98765 43210
            </a>
            <Link href="/properties"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-white/10 border border-white/20 text-white font-semibold px-8 py-4 rounded-full hover:bg-white/20 transition-colors text-base backdrop-blur-sm">
              Browse Properties
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
