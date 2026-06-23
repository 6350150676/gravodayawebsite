import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/properties";

export default function PropertyCard({ property }) {
  return (
    <Link
      href={`/properties/${property.id}`}
      className="group block overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200 transition hover:shadow-lg"
    >
      <div className="relative h-52 w-full overflow-hidden">
        <Image
          src={property.image}
          alt={property.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition duration-300 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-brand/90 px-3 py-1 text-xs font-semibold text-white">
          {property.type}
        </span>
      </div>

      <div className="p-5">
        <h3 className="text-lg font-semibold text-brand">{property.title}</h3>
        <p className="mt-1 text-sm text-gray-500">📍 {property.location}</p>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-xl font-bold text-gold">
            {formatPrice(property.price)}
          </span>
          <span className="text-sm text-gray-600">{property.area} sq ft</span>
        </div>

        {property.bhk > 0 && (
          <p className="mt-2 text-sm font-medium text-gray-700">
            {property.bhk} BHK · {property.city}
          </p>
        )}
      </div>
    </Link>
  );
}
