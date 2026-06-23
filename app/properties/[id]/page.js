import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  properties,
  getPropertyById,
  formatPrice,
} from "@/lib/properties";

// Pre-render a page for each property at build time.
export function generateStaticParams() {
  return properties.map((p) => ({ id: p.id }));
}

export function generateMetadata({ params }) {
  const property = getPropertyById(params.id);
  if (!property) return { title: "Property Not Found" };
  return {
    title: `${property.title} — Gravodaya Developers`,
    description: property.description,
  };
}

export default function PropertyDetailPage({ params }) {
  const property = getPropertyById(params.id);
  if (!property) notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Link
        href="/properties"
        className="text-sm font-medium text-gold hover:underline"
      >
        ← Back to all properties
      </Link>

      <div className="mt-4 overflow-hidden rounded-2xl">
        <div className="relative h-72 w-full md:h-96">
          <Image
            src={property.image}
            alt={property.title}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        </div>
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-3">
        {/* Main details */}
        <div className="md:col-span-2">
          <span className="rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white">
            {property.type}
          </span>
          <h1 className="mt-3 text-3xl font-bold text-brand">
            {property.title}
          </h1>
          <p className="mt-2 text-gray-500">📍 {property.location}</p>

          <div className="mt-6 flex flex-wrap gap-6 border-y border-gray-200 py-5 text-sm">
            {property.bhk > 0 && (
              <Stat label="Bedrooms" value={`${property.bhk} BHK`} />
            )}
            <Stat label="Area" value={`${property.area} sq ft`} />
            <Stat label="City" value={property.city} />
          </div>

          <h2 className="mt-8 text-xl font-semibold text-brand">Description</h2>
          <p className="mt-3 leading-relaxed text-gray-700">
            {property.description}
          </p>

          <h2 className="mt-8 text-xl font-semibold text-brand">Amenities</h2>
          <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {property.amenities.map((a) => (
              <li
                key={a}
                className="flex items-center gap-2 text-sm text-gray-700"
              >
                <span className="text-gold">✓</span> {a}
              </li>
            ))}
          </ul>
        </div>

        {/* Sidebar / contact box */}
        <aside className="h-fit rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <p className="text-sm text-gray-500">Price</p>
          <p className="text-3xl font-bold text-gold">
            {formatPrice(property.price)}
          </p>

          <Link
            href="/contact"
            className="mt-6 block rounded-full bg-brand px-6 py-3 text-center font-semibold text-white transition hover:bg-brand-light"
          >
            Contact Agent
          </Link>
          <Link
            href={`https://wa.me/916350150676?text=${encodeURIComponent(
              `Hi, I'm interested in "${property.title}" (${property.location}).`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 block rounded-full bg-[#25D366] px-6 py-3 text-center font-semibold text-white transition hover:opacity-90"
          >
            Enquire on WhatsApp
          </Link>
        </aside>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-gray-500">{label}</p>
      <p className="font-semibold text-brand">{value}</p>
    </div>
  );
}
