import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Phone, Building2, Home, Map, Store, Trees, ArrowRight, ArrowUpRight, Mail } from "lucide-react";
import { getFeaturedProperties, getCategories, getCities } from "@/lib/queries/properties";
import { getFeaturedProjects } from "@/lib/queries/projects";
import {
  getSiteSettings,
  getSiteFeatures,
  getIntentCards,
  getHeroSlides,
} from "@/lib/queries/site-content";
import { PropertyCard } from "@/components/public/PropertyCard";
import { ProjectShowcaseCard } from "@/components/public/home/ProjectShowcaseCard";
import { SectionHeading, Eyebrow } from "@/components/public/home/SectionHeading";
import { HeroSearch } from "@/components/public/HeroSearch";
import { HeroCarousel } from "@/components/public/HeroCarousel";
import { InquiryForm } from "@/components/public/InquiryForm";
import { Reveal } from "@/components/public/Reveal";

// Content is admin-edited, and every admin write revalidates these paths, so
// the window is a safety net rather than the freshness mechanism.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: { absolute: "Garvoday Developers — Premium Properties in Uttarakhand" },
  description:
    "Find premium villas, plots and residential properties in Haridwar. Trusted by families across Uttarakhand.",
  alternates: { canonical: "/" },
};

// Each one restates a commitment already made elsewhere on the site (hero
// slides, "Why choose us") — keep them in step if that copy changes.
const PROMISES = [
  { figure: "RERA", label: "Registered & legally compliant" },
  { figure: "0%", label: "Brokerage — buy direct" },
  { figure: "100%", label: "Transparent pricing" },
  { figure: "1:1", label: "Dedicated relationship manager" },
];

function categoryIcon(name: string) {
  const n = name.toLowerCase();
  if (/villa|house|independent|bungalow|duplex/.test(n)) return Home;
  if (/plot|land/.test(n)) return Map;
  if (/commercial|office|shop|retail|showroom/.test(n)) return Store;
  if (/farm|resort|retreat|cottage/.test(n)) return Trees;
  return Building2;
}

export default async function HomePage() {
  const [featured, projects, categories, cities, settings, features, intentCards] =
    await Promise.all([
      getFeaturedProperties(6),
      getFeaturedProjects(3),
      getCategories(),
      getCities(),
      getSiteSettings(),
      getSiteFeatures(),
      getIntentCards(),
    ]);
  const heroSlides = getHeroSlides();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.garvodayrealty.com";

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: "Garvoday Developers Pvt. Ltd.",
    url: siteUrl,
    logo: `${siteUrl}/logo-square.png`,
    image: `${siteUrl}/og-image.png`,
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

  // Section numbers ("01", "02"…) follow render order, so a section that's
  // hidden for lack of content doesn't leave a gap in the sequence.
  let sectionCount = 0;
  const nextIndex = () => String(++sectionCount).padStart(2, "0");

  const closingImage = heroSlides[heroSlides.length - 1]?.image_url ?? settings.hero_image_url;

  return (
    <div className="bg-(--color-sand)">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />

      {/* ── HERO CAROUSEL ────────────────────────────────────────── */}
      <HeroCarousel slides={heroSlides}>
        <HeroSearch cities={cities} categories={categories} />
      </HeroCarousel>

      {/* ── BRAND STATEMENT ─────────────────────────────────────── */}
      <section className="bg-(--color-ivory) border-b border-(--color-charcoal)/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-16 items-center">
          <Reveal className="lg:col-span-7">
            <Eyebrow>Garvoday Developers Pvt. Ltd.</Eyebrow>
            <p className="mt-7 font-display text-[2rem] sm:text-4xl lg:text-[2.75rem] leading-[1.18] text-(--color-forest) text-balance">
              A family-owned, RERA-registered developer building{" "}
              <em className="text-(--color-terracotta)">gated communities</em> across Haridwar —
              planned, approved and delivered by our own team.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-x-10 gap-y-4 text-xs font-semibold uppercase tracking-[0.22em] text-(--color-forest)">
              <Link href="/about" className="link-line">
                Our story <ArrowRight size={14} />
              </Link>
              <Link href="/sell" className="link-line text-(--color-terracotta)">
                List your property <ArrowRight size={14} />
              </Link>
            </div>
          </Reveal>

          <Reveal delay={150} className="lg:col-span-5">
            <dl className="grid grid-cols-2 border-t border-l border-(--color-charcoal)/12">
              {PROMISES.map((p) => (
                <div key={p.label} className="border-r border-b border-(--color-charcoal)/12 px-5 py-7 sm:px-7 sm:py-9">
                  <dt className="font-display text-4xl sm:text-5xl leading-none text-(--color-forest)">{p.figure}</dt>
                  <dd className="mt-3 text-[11px] sm:text-xs font-medium uppercase tracking-[0.18em] leading-relaxed text-(--color-charcoal)/65">
                    {p.label}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      {/* ── OUR PROJECTS ────────────────────────────────────────── */}
      {projects.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <SectionHeading
            index={nextIndex()}
            eyebrow="Featured Projects"
            title={<>Our <em>Projects</em></>}
            intro="Gated colonies and villa developments planned, approved and delivered by our own team."
            action={{ href: "/projects", label: "View all projects" }}
          />
          {/* Lead project takes the wide, tall tile; the rest stack beside it */}
          <div className="mt-14 grid grid-cols-1 gap-5 lg:grid-cols-12 lg:auto-rows-[340px]">
            {projects.map((p, i) => {
              const span =
                projects.length === 1
                  ? "lg:col-span-12 lg:row-span-2"
                  : i === 0
                    ? "lg:col-span-7 lg:row-span-2"
                    : projects.length === 2
                      ? "lg:col-span-5 lg:row-span-2"
                      : "lg:col-span-5";
              return (
                <Reveal key={p.id} delay={i * 120} className={span}>
                  <ProjectShowcaseCard project={p} supabaseUrl={supabaseUrl} feature={i === 0} />
                </Reveal>
              );
            })}
          </div>
        </section>
      )}

      {/* ── PROJECT ENQUIRY ─────────────────────────────────────── */}
      {projects.length > 0 && (
        <section className="grain relative isolate overflow-hidden bg-(--color-forest) text-white">
          <div
            aria-hidden="true"
            className="absolute -top-40 -right-40 -z-10 h-[34rem] w-[34rem] rounded-full bg-(--color-terracotta)/15 blur-3xl"
          />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-16 items-center">
            <Reveal className="lg:col-span-5">
              <SectionHeading
                tone="dark"
                index={nextIndex()}
                eyebrow="Enquire Now"
                title={<>Interested in one of our <em>projects?</em></>}
                intro="Leave your details and our team will call you back with layouts, availability and exact pricing — or talk to us right away."
              />
              <dl className="mt-10 border-t border-white/15">
                <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-6 border-b border-white/15 py-6">
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.26em] text-white/50">Call us</dt>
                  <dd>
                    <a href={`tel:${settings.phone_tel}`} className="inline-flex items-center gap-3 font-display text-2xl sm:text-3xl hover:text-(--color-terracotta-light) transition-colors">
                      <Phone size={18} className="text-(--color-terracotta-light)" /> {settings.phone_display}
                    </a>
                  </dd>
                </div>
                <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-6 border-b border-white/15 py-6">
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.26em] text-white/50">Write to us</dt>
                  <dd className="min-w-0">
                    <a href={`mailto:${settings.contact_email}`} className="inline-flex items-center gap-3 text-sm sm:text-base text-white/85 hover:text-(--color-terracotta-light) transition-colors">
                      <Mail size={16} className="shrink-0 text-(--color-terracotta-light)" /> {settings.contact_email}
                    </a>
                  </dd>
                </div>
              </dl>
            </Reveal>

            <Reveal delay={150} className="lg:col-span-6 lg:col-start-7">
              <div className="rounded-sm bg-(--color-ivory) p-6 sm:p-10 text-(--color-charcoal) shadow-[0_40px_100px_-30px_rgba(0,0,0,0.6)]">
                <h3 className="font-display text-3xl font-medium text-(--color-forest)">Send us your enquiry</h3>
                <p className="mt-1.5 mb-7 text-sm text-(--color-charcoal)/55">
                  We usually get back within a few hours.
                </p>
                <InquiryForm title="Garvoday Projects" phone={settings.phone_tel} />
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* ── WHAT ARE YOU LOOKING FOR ─────────────────────────────── */}
      {(intentCards.length > 0 || categories.length > 0) && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <SectionHeading
            index={nextIndex()}
            eyebrow="How Can We Help?"
            title={<>What are you <em>looking for?</em></>}
          />

          {intentCards.length > 0 && (
            <div className="mt-14 grid grid-cols-1 gap-5 md:grid-flow-col md:auto-cols-fr">
              {intentCards.map((card, i) => (
                <Reveal key={card.title} delay={i * 120}>
                  <Link
                    href={card.href}
                    className="group relative isolate flex h-[420px] lg:h-[500px] flex-col justify-end overflow-hidden bg-(--color-forest) p-7 sm:p-10 text-white"
                  >
                    {card.image_url && (
                      <Image
                        src={card.image_url}
                        alt={card.title}
                        fill
                        className="-z-20 object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.05]"
                        sizes="(max-width:768px) 100vw, 50vw"
                      />
                    )}
                    {/* The admin-set accent tints the foot of the photo */}
                    <div
                      className="absolute inset-0 -z-10"
                      style={{
                        background: `linear-gradient(to top, color-mix(in srgb, ${card.accent} 92%, transparent) 0%, color-mix(in srgb, ${card.accent} 65%, transparent) 50%, color-mix(in srgb, ${card.accent} 15%, transparent) 85%, transparent 100%)`,
                      }}
                    />
                    {card.subtitle && (
                      <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/80">
                        <span className="h-px w-8 bg-(--color-terracotta-light)" />
                        {card.subtitle}
                      </p>
                    )}
                    <h3 className="mt-4 font-display text-4xl lg:text-5xl font-medium leading-none">{card.title}</h3>
                    {card.description && (
                      <p className="mt-4 max-w-sm text-sm sm:text-[15px] leading-relaxed text-white/75">{card.description}</p>
                    )}
                    {card.cta && (
                      <span className="link-line mt-7 self-start text-xs font-semibold uppercase tracking-[0.22em]">
                        {card.cta}
                      </span>
                    )}
                  </Link>
                </Reveal>
              ))}
            </div>
          )}

          {categories.length > 0 && (
            <Reveal className="mt-16">
              <div className="mb-2 flex items-center justify-between gap-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-(--color-charcoal)/55">
                  Browse by property type
                </p>
                <Link href="/properties" className="link-line text-xs font-semibold uppercase tracking-[0.22em] text-(--color-forest)">
                  View all <ArrowRight size={14} />
                </Link>
              </div>
              {/* Hairline index: one row on desktop, a list on mobile */}
              <div className="grid grid-cols-1 gap-px border-y border-(--color-charcoal)/15 bg-(--color-charcoal)/15 lg:grid-flow-col lg:auto-cols-fr">
                {categories.map((c) => {
                  const Icon = categoryIcon(c.name);
                  return (
                    <Link
                      key={c.id}
                      href={`/properties?category=${c.id}`}
                      className="group flex items-center justify-between gap-4 bg-(--color-sand) py-7 lg:px-7 lg:first:pl-0 transition-colors"
                    >
                      <span className="flex items-center gap-4">
                        <Icon size={22} strokeWidth={1.25} className="shrink-0 text-(--color-terracotta)" />
                        <span className="font-display text-2xl leading-tight text-(--color-forest) transition-colors group-hover:text-(--color-terracotta)">
                          {c.name}
                        </span>
                      </span>
                      <ArrowUpRight
                        size={18}
                        className="shrink-0 text-(--color-forest)/40 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-(--color-terracotta)"
                      />
                    </Link>
                  );
                })}
              </div>
            </Reveal>
          )}
        </section>
      )}

      {/* ── FEATURED PROPERTIES ────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="border-t border-(--color-charcoal)/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
            <SectionHeading
              index={nextIndex()}
              eyebrow="Handpicked for You"
              title={<>Featured <em>Properties</em></>}
              action={{ href: "/properties", label: "View all properties" }}
            />
            <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((p, i) => (
                <Reveal key={p.id} delay={(i % 3) * 110}>
                  <PropertyCard property={p} supabaseUrl={supabaseUrl} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── WHY GARVODAY ────────────────────────────────────────── */}
      <section className="bg-(--color-ivory) border-y border-(--color-charcoal)/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-20 items-center">

          {/* Photo, set in an offset terracotta frame */}
          <Reveal className="lg:col-span-6">
            <figure className="relative mr-4 mb-4 sm:mr-6 sm:mb-6">
              <div aria-hidden="true" className="absolute inset-0 translate-x-4 translate-y-4 sm:translate-x-6 sm:translate-y-6 border border-(--color-terracotta)/60" />
              <div className="relative aspect-[4/5] lg:aspect-auto lg:h-[620px] overflow-hidden">
                <Image
                  src={settings.whyus_image_url}
                  alt="Har Ki Pauri ghat on the Ganga in Haridwar"
                  fill
                  className="object-cover"
                  sizes="(max-width:1024px) 100vw, 50vw"
                />
              </div>
              <figcaption className="absolute left-0 bottom-0 bg-(--color-forest) px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.26em] text-white/85">
                {settings.company_tagline}
              </figcaption>
            </figure>
          </Reveal>

          <Reveal delay={150} className="lg:col-span-6">
            <SectionHeading
              index={nextIndex()}
              eyebrow="Why Choose Us"
              title={<>Where trust meets <em>real estate</em></>}
              intro="We know that buying a home is one of the most important decisions of your life. Our team makes it simple, transparent, and joyful — with honest pricing and hands-on guidance at every step."
            />
            <ol className="mt-10 border-t border-(--color-charcoal)/12">
              {features.map((item, i) => (
                <li key={item} className="flex items-baseline gap-6 border-b border-(--color-charcoal)/12 py-5">
                  <span className="w-7 shrink-0 font-display text-lg text-(--color-terracotta)">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[15px] leading-relaxed text-(--color-charcoal)/80">{item}</span>
                </li>
              ))}
            </ol>
            <a
              href={`tel:${settings.phone_tel}`}
              className="mt-10 inline-flex items-center gap-3 rounded-sm bg-(--color-forest) px-8 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-white hover:bg-(--color-terracotta) transition-colors duration-300"
            >
              <Phone size={15} /> Call for Free Consultation
            </a>
          </Reveal>
        </div>
      </section>

      {/* ── CLOSING CTA ─────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden bg-(--color-forest) text-white">
        <Image src={closingImage} alt="" fill className="-z-20 object-cover" sizes="100vw" />
        <div className="absolute inset-0 -z-10 bg-(--color-forest)/85" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-28 lg:py-36 text-center">
          <Reveal>
            <div className="flex justify-center">
              <Eyebrow tone="dark">Let&apos;s Talk</Eyebrow>
            </div>
            <h2 className="mt-6 font-display font-medium text-[2.6rem] leading-[1.05] sm:text-6xl lg:text-7xl tracking-[-0.01em] text-balance">
              Ready to find your <em className="font-normal text-(--color-terracotta-light)">perfect home?</em>
            </h2>
            <p className="mt-6 text-base sm:text-lg text-white/70 max-w-md mx-auto">
              Talk to our experts today — free consultation, zero obligations.
            </p>
            <div className="mt-11 flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={`tel:${settings.phone_tel}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-sm bg-(--color-terracotta) px-9 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-white hover:bg-(--color-terracotta-light) transition-colors duration-300"
              >
                <Phone size={15} /> {settings.phone_display}
              </a>
              <Link
                href="/properties"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-sm border border-white/35 px-9 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-white hover:bg-white hover:text-(--color-forest) transition-colors duration-300"
              >
                Browse Properties <ArrowRight size={15} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

    </div>
  );
}
