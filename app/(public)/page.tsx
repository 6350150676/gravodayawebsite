import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Phone, Building2, Home, Map, Store, Trees, ArrowRight } from "lucide-react";
import { getFeaturedProperties, getCategories, getCities } from "@/lib/queries/properties";
import {
  getSiteSettings,
  getSiteFeatures,
  getIntentCards,
  getHeroSlides,
} from "@/lib/queries/site-content";
import { PropertyCard } from "@/components/public/PropertyCard";
import { HeroSearch } from "@/components/public/HeroSearch";
import { HeroCarousel } from "@/components/public/HeroCarousel";
import { Reveal } from "@/components/public/Reveal";

export const metadata: Metadata = {
  title: { absolute: "Garvoday Developers — Premium Properties in Uttarakhand" },
  description:
    "Find premium villas, plots and residential properties in Haridwar. Trusted by families across Uttarakhand.",
  alternates: { canonical: "/" },
};

function categoryIcon(name: string) {
  const n = name.toLowerCase();
  if (/villa|house|independent|bungalow|duplex/.test(n)) return Home;
  if (/plot|land/.test(n)) return Map;
  if (/commercial|office|shop|retail|showroom/.test(n)) return Store;
  if (/farm|resort|retreat|cottage/.test(n)) return Trees;
  return Building2;
}

export default async function HomePage() {
  const [featured, categories, cities, settings, features, intentCards] =
    await Promise.all([
      getFeaturedProperties(6),
      getCategories(),
      getCities(),
      getSiteSettings(),
      getSiteFeatures(),
      getIntentCards(),
    ]);
  const heroSlides = getHeroSlides();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://garvoday.com";

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: "Garvoday Developers Pvt. Ltd.",
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    image: `${siteUrl}/logo.png`,
    telephone: settings.phone_tel,
    email: settings.contact_email,
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.contact_address,
      addressLocality: "Haridwar",
      addressRegion: "Uttarakhand",
      addressCountry: "IN",
    },
    areaServed: {
      "@type": "City",
      name: "Haridwar",
    },
  };

  return (
    <div className="bg-[var(--color-sand)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />

      {/* ── HERO CAROUSEL ────────────────────────────────────────── */}
      <HeroCarousel slides={heroSlides}>
        {/* Search widget */}
        <div className="mt-8">
          <HeroSearch cities={cities} categories={categories} />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-white/55 text-sm">
          <span>✓ RERA Registered</span>
          <span>✓ Transparent Pricing</span>
          <span>✓ Local Haridwar Experts</span>
          <Link href="/contact" className="text-[var(--color-gold)] font-semibold hover:underline">
            List your property →
          </Link>
        </div>
      </HeroCarousel>

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
      {intentCards.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-20">
          <div className="text-center mb-12">
            <p className="text-[var(--color-gold)] text-xs font-bold tracking-[0.22em] uppercase mb-3">How Can We Help?</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-brand)]">What Are You Looking For?</h2>
            <div className="mt-3 mx-auto w-16 h-1 bg-[var(--color-gold)] rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {intentCards.map((card, i) => (
              <Reveal key={card.title} delay={i * 120}>
                <Link href={card.href}
                  className="group block h-full bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 hover:border-[var(--color-gold)]/30 hover:-translate-y-1 transition-all duration-300">

                  {/* Card photo */}
                  <div className="relative h-44 overflow-hidden">
                    {card.image_url && (
                      <Image src={card.image_url} alt={card.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width:768px) 100vw, 33vw" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    {card.subtitle && (
                      <span className="absolute bottom-3 left-4 text-white text-xs font-bold tracking-[0.15em] uppercase"
                        style={{ textShadow: "0 1px 4px rgba(0,0,0,.6)" }}>
                        {card.subtitle}
                      </span>
                    )}
                  </div>

                  {/* Card text */}
                  <div className="p-6">
                    <div className="w-8 h-1 rounded-full mb-4 transition-all duration-300 group-hover:w-12" style={{ backgroundColor: card.accent }} />
                    <h3 className="text-xl font-bold text-[var(--color-brand)] mb-2">{card.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-5">{card.description}</p>
                    {card.cta && (
                      <span className="inline-flex items-center gap-1 text-sm font-semibold transition-all group-hover:gap-2" style={{ color: card.accent }}>{card.cta}</span>
                    )}
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

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
                We know that buying a home is one of the most important decisions of your life. Our team makes it simple, transparent, and joyful — with honest pricing and hands-on guidance at every step.
              </p>
              <ul className="space-y-3.5">
                {features.map((item) => (
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
                <a href={`tel:${settings.phone_tel}`}
                  className="inline-flex items-center gap-2.5 bg-[var(--color-royal)] text-white font-bold px-7 py-3.5 rounded-full hover:bg-[var(--color-royal-dark)] transition-colors shadow-lg">
                  <Phone size={15} /> Call for Free Consultation
                </a>
              </div>
            </Reveal>

            {/* Right: photo */}
            <Reveal delay={150} className="relative">
              <div className="relative h-[480px] rounded-3xl overflow-hidden shadow-2xl">
                <Image src={settings.whyus_image_url} alt="Beautiful property interior" fill className="object-cover" sizes="(max-width:1024px) 100vw, 50vw" />
                {/* Gold accent card overlay */}
                <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[var(--color-gold)] flex items-center justify-center flex-shrink-0 font-bold text-[var(--color-brand)] text-xl">G</div>
                    <div>
                      <p className="font-bold text-[var(--color-brand)] text-sm">Garvoday Developers</p>
                      <p className="text-gray-500 text-xs mt-0.5">{settings.company_tagline}</p>
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
          <p className="text-[var(--color-gold)] text-xs font-bold tracking-[0.2em] uppercase mb-4">Let&apos;s Talk</p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to Find Your Perfect Home?
          </h2>
          <p className="text-white/60 mb-10 text-base max-w-md mx-auto">
            Talk to our experts today — free consultation, zero obligations.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href={`tel:${settings.phone_tel}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[var(--color-gold)] text-[var(--color-brand)] font-bold px-8 py-4 rounded-full hover:bg-[var(--color-gold-light)] transition-colors shadow-lg text-base">
              <Phone size={16} /> {settings.phone_display}
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
