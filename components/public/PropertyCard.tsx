import Link from "next/link";
import { MapPin, BedDouble, Bath, Maximize2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { PropertyWithRelations } from "@/types";

interface Props {
  property: PropertyWithRelations;
  supabaseUrl: string;
}

export function PropertyCard({ property, supabaseUrl }: Props) {
  const cover = property.images.find((i) => i.is_cover) ?? property.images[0];

  return (
    <Link href={`/properties/${property.slug}`} className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100">
      {/* Image */}
      <div className="relative h-52 bg-gray-100 overflow-hidden">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`${supabaseUrl}/storage/v1/object/public/property-images/${cover.storage_path}`}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${property.is_for_rent ? "bg-purple-600 text-white" : "bg-[var(--color-brand)] text-white"}`}>
            {property.is_for_rent ? "RENT" : "SALE"}
          </span>
          {property.is_featured && (
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[var(--color-gold)] text-[var(--color-brand)]">
              FEATURED
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <p className="font-semibold text-gray-900 text-[15px] leading-snug line-clamp-2 group-hover:text-[var(--color-brand)] transition-colors mb-2">
          {property.title}
        </p>

        <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-3">
          <MapPin size={12} className="flex-shrink-0" />
          <span className="truncate">
            {property.locality ? `${property.locality.name}, ` : ""}{property.city.name}
          </span>
        </div>

        {/* Specs */}
        {(property.bedrooms || property.bathrooms || property.area_sqft) && (
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

        {/* Price */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xl font-bold text-[var(--color-brand)]">{formatPrice(property.price)}</p>
            {property.is_for_rent && <p className="text-xs text-gray-400">per month</p>}
          </div>
          <span className="text-xs font-semibold text-[var(--color-brand)] bg-blue-50 px-3 py-1.5 rounded-full">
            {property.category.name}
          </span>
        </div>
      </div>
    </Link>
  );
}
