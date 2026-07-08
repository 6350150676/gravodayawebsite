import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronRight,
  MapPin,
  BedDouble,
  Bath,
  Maximize2,
  Building2,
  CalendarDays,
  Check,
  Phone,
  MessageCircle,
  ShieldCheck,
  BadgeCheck,
} from "lucide-react";
import { getPropertyBySlug, getRelatedProperties } from "@/lib/queries/properties";
import { getSiteSettings } from "@/lib/queries/site-content";
import { formatPrice } from "@/lib/utils";
import { PropertyGallery } from "@/components/public/PropertyGallery";
import { InquiryForm } from "@/components/public/InquiryForm";
import { PropertyCard } from "@/components/public/PropertyCard";
import { Reveal } from "@/components/public/Reveal";

export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

function imageUrl(path: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/property-images/${path}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property) return { title: "Property not found — Garvoday Developers" };

  const cover = property.images.find((i) => i.is_cover) ?? property.images[0];
  return {
    title: `${property.title} — Garvoday Developers`,
    description: property.description.slice(0, 155),
    alternates: { canonical: `/properties/${slug}` },
    openGraph: {
      title: property.title,
      description: property.description.slice(0, 155),
      images: cover ? [imageUrl(cover.storage_path)] : [],
    },
  };
}

export default async function PropertyDetailPage({ params }: Props) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property || property.status !== "active") notFound();

  const [related, settings] = await Promise.all([
    getRelatedProperties(property, 3),
    getSiteSettings(),
  ]);
  const PHONE_DISPLAY = settings.phone_display;
  const PHONE_TEL = settings.phone_tel;
  const WHATSAPP = settings.whatsapp_number;

  // Sort images: cover first, then by sort_order
  const sorted = [...property.images].sort((a, b) => {
    if (a.is_cover !== b.is_cover) return a.is_cover ? -1 : 1;
    return a.sort_order - b.sort_order;
  });
  const galleryImages = sorted.map((img) => ({
    url: imageUrl(img.storage_path),
    alt: property.title,
  }));

  const locationText = [property.locality?.name, property.city.name].filter(Boolean).join(", ");
  const listedOn = new Date(property.created_at).toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });

  const specs = [
    property.bedrooms != null && { icon: BedDouble, label: "Bedrooms", value: `${property.bedrooms}` },
    property.bathrooms != null && { icon: Bath, label: "Bathrooms", value: `${property.bathrooms}` },
    property.area_sqft && {
      icon: Maximize2,
      label: "Area",
      value: `${property.area_sqft.toLocaleString("en-IN")} sq.ft`,
    },
    { icon: Building2, label: "Type", value: property.category.name },
  ].filter(Boolean) as { icon: typeof BedDouble; label: string; value: string }[];

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://garvoday.com";
  const propertyUrl = `${siteUrl}/properties/${property.slug}`;

  const listingJsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    url: propertyUrl,
    name: property.title,
    description: property.description,
    image: galleryImages.map((img) => img.url),
    datePosted: property.created_at,
    address: {
      "@type": "PostalAddress",
      streetAddress: property.address || undefined,
      addressLocality: property.city.name,
      addressRegion: "Uttarakhand",
      addressCountry: "IN",
    },
    offers: {
      "@type": "Offer",
      price: property.price,
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      businessFunction: property.is_for_rent ? "https://schema.org/LeaseOut" : "https://schema.org/Sell",
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Properties", item: `${siteUrl}/properties` },
      { "@type": "ListItem", position: 3, name: property.title, item: propertyUrl },
    ],
  };

  return (
    <div className="bg-[var(--color-sand)] min-h-screen pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(listingJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {/* ── Breadcrumb ──────────────────────────────────────────── */}
      <div className="border-b border-gray-200 bg-white">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center gap-1.5 text-xs text-gray-400 overflow-x-auto no-scrollbar">
          <Link href="/" className="hover:text-[var(--color-brand)] whitespace-nowrap">Home</Link>
          <ChevronRight size={13} />
          <Link href="/properties" className="hover:text-[var(--color-brand)] whitespace-nowrap">Properties</Link>
          <ChevronRight size={13} />
          <span className="text-gray-600 font-medium truncate">{property.title}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">

          {/* ════════════ LEFT COLUMN ════════════ */}
          <div className="min-w-0">
            <PropertyGallery
              images={galleryImages}
              badges={
                <>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${property.is_for_rent ? "bg-[var(--color-royal)] text-white" : "bg-[var(--color-brand)] text-white"}`}>
                    {property.is_for_rent ? "FOR RENT" : "FOR SALE"}
                  </span>
                  {property.is_featured && (
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[var(--color-gold)] text-[var(--color-brand)]">
                      FEATURED
                    </span>
                  )}
                </>
              }
            />

            {/* Title block */}
            <div className="mt-6">
              <span className="inline-block text-xs font-semibold text-[var(--color-royal)] bg-[var(--color-royal)]/10 px-3 py-1 rounded-full">
                {property.category.name}
              </span>
              <h1 className="mt-3 text-2xl sm:text-3xl font-bold text-[var(--color-brand)] leading-tight break-words">
                {property.title}
              </h1>
              <p className="mt-2 flex items-center gap-1.5 text-gray-500 text-sm">
                <MapPin size={15} className="text-[var(--color-gold)]" />
                {property.address ? `${property.address}, ` : ""}{locationText}
              </p>

              {/* Price — mobile only (sidebar shows it on desktop) */}
              <div className="lg:hidden mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-[var(--color-royal)]">
                  {property.price_label || formatPrice(property.price)}
                </span>
                {property.is_for_rent && <span className="text-sm text-gray-400">/ month</span>}
              </div>
            </div>

            {/* Key specs */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {specs.map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
                  <Icon size={20} className="mx-auto text-[var(--color-gold)]" />
                  <p className="mt-2 text-base font-bold text-gray-900">{value}</p>
                  <p className="text-[11px] text-gray-400 uppercase tracking-wide">{label}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            <Reveal as="section" className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-[var(--color-brand)] mb-3">About this property</h2>
              <p className="text-gray-600 text-[15px] leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
              <div className="mt-5 pt-4 border-t border-gray-100 flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-400">
                <span className="flex items-center gap-1.5"><CalendarDays size={13} /> Listed {listedOn}</span>
                <span className="flex items-center gap-1.5"><Building2 size={13} /> {property.category.name}</span>
                <span className="flex items-center gap-1.5"><MapPin size={13} /> {property.city.name}</span>
              </div>
            </Reveal>

            {/* Amenities */}
            {property.amenities.length > 0 && (
              <Reveal as="section" className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-lg font-bold text-[var(--color-brand)] mb-4">Amenities &amp; Features</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {property.amenities.map((a) => (
                    <div key={a} className="flex items-center gap-2.5 text-sm text-gray-600">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--color-gold)]/15 flex items-center justify-center">
                        <Check size={12} className="text-[var(--color-gold)]" strokeWidth={3} />
                      </span>
                      {a}
                    </div>
                  ))}
                </div>
              </Reveal>
            )}


          </div>

          {/* ════════════ RIGHT SIDEBAR ════════════ */}
          <aside className="lg:sticky lg:top-20 lg:self-start space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Price header */}
              <div className="bg-[var(--color-brand)] px-6 py-5">
                <p className="text-white/55 text-xs uppercase tracking-wide mb-1">
                  {property.is_for_rent ? "Monthly Rent" : "Price"}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-white">
                    {property.price_label || formatPrice(property.price)}
                  </span>
                  {property.is_for_rent && <span className="text-white/50 text-sm">/ month</span>}
                </div>
              </div>

              {/* Form */}
              <div className="p-6">
                <h3 className="text-base font-bold text-[var(--color-brand)] mb-1">Interested in this property?</h3>
                <p className="text-xs text-gray-400 mb-4">Send us a message and we&apos;ll get back to you.</p>
                <InquiryForm propertyId={property.id} propertyTitle={property.title} phone={PHONE_TEL} />
              </div>

              {/* Quick contact */}
              <div className="px-6 pb-6 grid grid-cols-2 gap-3">
                <a
                  href={`tel:${PHONE_TEL}`}
                  className="flex items-center justify-center gap-2 border border-[var(--color-royal)]/40 text-[var(--color-royal)] font-semibold text-sm px-3 py-2.5 rounded-xl hover:bg-[var(--color-royal)]/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-royal)] focus-visible:ring-offset-1"
                >
                  <Phone size={15} /> Call
                </a>
                <a
                  href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Hi, I'm interested in "${property.title}"`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-green-600 text-white font-semibold text-sm px-3 py-2.5 rounded-xl hover:bg-green-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-1"
                >
                  <MessageCircle size={15} /> WhatsApp
                </a>
              </div>
            </div>

            {/* Trust badges */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
              <TrustRow icon={ShieldCheck} text="RERA registered & verified listing" />
              <TrustRow icon={BadgeCheck} text="No brokerage, transparent pricing" />
              <TrustRow icon={Phone} text={`Talk to an expert: ${PHONE_DISPLAY}`} />
            </div>
          </aside>
        </div>

        {/* ── Related properties ──────────────────────────────────── */}
        {related.length > 0 && (
          <section className="mt-14">
            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="text-[var(--color-gold)] text-xs font-bold tracking-[0.2em] uppercase mb-1">
                  You may also like
                </p>
                <h2 className="text-2xl font-bold text-[var(--color-brand)]">
                  Similar properties in {property.city.name}
                </h2>
              </div>
              <Link href="/properties" className="hidden sm:block text-sm font-semibold text-[var(--color-brand)] hover:text-[var(--color-gold)] transition-colors">
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((p) => (
                <PropertyCard key={p.id} property={p} supabaseUrl={SUPABASE_URL} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function TrustRow({ icon: Icon, text }: { icon: typeof ShieldCheck; text: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-gray-600">
      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--color-brand)]/5 flex items-center justify-center">
        <Icon size={16} className="text-[var(--color-brand)]" />
      </span>
      {text}
    </div>
  );
}
