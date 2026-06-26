import Link from "next/link";
import Image from "next/image";
import { MapPin, BedDouble, Bath, Maximize2, ArrowRight, CalendarDays } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { PropertyWithRelations } from "@/types";

interface Props {
  property: PropertyWithRelations;
  supabaseUrl: string;
  layout?: "vertical" | "horizontal";
}

export function PropertyCard({ property, supabaseUrl, layout = "vertical" }: Props) {
  const cover = property.images.find((i) => i.is_cover) ?? property.images[0];
  const imgSrc = cover
    ? `${supabaseUrl}/storage/v1/object/public/property-images/${cover.storage_path}`
    : null;

  const location = `${property.locality ? `${property.locality.name}, ` : ""}${property.city.name}`;
  const perSqft =
    property.area_sqft && property.price ? Math.round(property.price / property.area_sqft) : null;
  const listedOn = new Date(property.created_at).toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });

  /* ── Horizontal (listing-page / portal) variant ─────────────────── */
  if (layout === "horizontal") {
    return (
      <Link
        href={`/properties/${property.slug}`}
        className="group flex flex-col sm:flex-row bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg border border-gray-100 hover:border-[var(--color-gold)]/30 transition-all duration-300"
      >
        {/* Image */}
        <div className="relative sm:w-72 lg:w-80 flex-shrink-0 h-52 sm:h-auto sm:min-h-[210px] bg-gray-100 overflow-hidden">
          <CoverImage src={imgSrc} alt={property.title} sizes="(max-width:640px) 100vw, 320px" />
          <Badges property={property} />
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 min-w-0 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-bold text-gray-900 text-base sm:text-lg leading-snug line-clamp-2 group-hover:text-[var(--color-brand)] transition-colors">
                {property.title}
              </h3>
              <p className="mt-1.5 flex items-center gap-1.5 text-gray-400 text-xs sm:text-sm">
                <MapPin size={13} className="flex-shrink-0 text-[var(--color-gold)]" />
                <span className="truncate">{location}</span>
              </p>
            </div>
            <span className="hidden sm:inline-block flex-shrink-0 text-xs font-semibold text-[var(--color-royal)] bg-[var(--color-royal)]/10 px-3 py-1 rounded-full">
              {property.category.name}
            </span>
          </div>

          {/* Specs */}
          {(property.bedrooms != null || property.bathrooms != null || property.area_sqft) && (
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-gray-600 text-sm mt-4 border-t border-gray-100 pt-4">
              {property.bedrooms != null && (
                <span className="flex items-center gap-1.5"><BedDouble size={15} className="text-gray-400" /> {property.bedrooms} BHK</span>
              )}
              {property.bathrooms != null && (
                <span className="flex items-center gap-1.5"><Bath size={15} className="text-gray-400" /> {property.bathrooms} Bath</span>
              )}
              {property.area_sqft && (
                <span className="flex items-center gap-1.5"><Maximize2 size={14} className="text-gray-400" /> {property.area_sqft.toLocaleString("en-IN")} sq.ft</span>
              )}
            </div>
          )}

          {/* Footer: price + CTA */}
          <div className="flex items-end justify-between gap-3 mt-auto pt-4">
            <div>
              <p className="text-xl sm:text-2xl font-bold text-[var(--color-royal)]">
                {formatPrice(property.price)}
                {property.is_for_rent && <span className="text-sm font-medium text-gray-400"> /mo</span>}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-2">
                {perSqft && <span>₹{perSqft.toLocaleString("en-IN")}/sq.ft</span>}
                <span className="flex items-center gap-1"><CalendarDays size={11} /> {listedOn}</span>
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-brand)] bg-[var(--color-brand)]/5 group-hover:bg-[var(--color-brand)] group-hover:text-white px-4 py-2.5 rounded-xl transition-colors">
              View Details <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </Link>
    );
  }

  /* ── Vertical (homepage grid) variant ───────────────────────────── */
  return (
    <Link
      href={`/properties/${property.slug}`}
      className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100 h-full"
    >
      <div className="relative h-52 bg-gray-100 overflow-hidden">
        <CoverImage src={imgSrc} alt={property.title} sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw" />
        <Badges property={property} />
      </div>

      <div className="p-5">
        <p className="font-semibold text-gray-900 text-[15px] leading-snug line-clamp-2 group-hover:text-[var(--color-brand)] transition-colors mb-2">
          {property.title}
        </p>

        <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-3">
          <MapPin size={12} className="flex-shrink-0" />
          <span className="truncate">{location}</span>
        </div>

        {(property.bedrooms != null || property.bathrooms != null || property.area_sqft) && (
          <div className="flex items-center gap-4 text-gray-500 text-xs mb-4 border-t border-gray-100 pt-3">
            {property.bedrooms != null && (
              <span className="flex items-center gap-1"><BedDouble size={13} /> {property.bedrooms} BHK</span>
            )}
            {property.bathrooms != null && (
              <span className="flex items-center gap-1"><Bath size={13} /> {property.bathrooms}</span>
            )}
            {property.area_sqft && (
              <span className="flex items-center gap-1"><Maximize2 size={12} /> {property.area_sqft.toLocaleString("en-IN")} sq.ft</span>
            )}
          </div>
        )}

        <div className="flex items-end justify-between">
          <div>
            <p className="text-xl font-bold text-[var(--color-royal)]">{formatPrice(property.price)}</p>
            {property.is_for_rent && <p className="text-xs text-gray-400">per month</p>}
          </div>
          <span className="text-xs font-semibold text-[var(--color-royal)] bg-[var(--color-royal)]/10 px-3 py-1.5 rounded-full">
            {property.category.name}
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ── shared pieces ───────────────────────────────────────────────── */
function CoverImage({ src, alt, sizes }: { src: string | null; alt: string; sizes: string }) {
  if (!src) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-300">
        <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      </div>
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      className="object-cover group-hover:scale-105 transition-transform duration-500"
    />
  );
}

function Badges({ property }: { property: PropertyWithRelations }) {
  return (
    <div className="absolute top-3 left-3 flex gap-2">
      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${property.is_for_rent ? "bg-[var(--color-royal)] text-white" : "bg-[var(--color-brand)] text-white"}`}>
        {property.is_for_rent ? "RENT" : "SALE"}
      </span>
      {property.is_featured && (
        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[var(--color-gold)] text-[var(--color-brand)]">
          FEATURED
        </span>
      )}
    </div>
  );
}
