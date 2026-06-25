import type { Metadata } from "next";
import { Suspense } from "react";
import { getProperties, getCategories, getCities } from "@/lib/queries/properties";
import { PropertyCard } from "@/components/public/PropertyCard";
import { PropertyFilters } from "@/components/public/PropertyFilters";

export const metadata: Metadata = {
  title: "Properties — Gravodaya Developers",
  description: "Browse apartments, villas, plots and commercial spaces for sale and rent in Dehradun, Haridwar and Rishikesh.",
};

interface Props {
  searchParams: Promise<{
    type?: string;
    category?: string;
    city?: string;
    q?: string;
    min?: string;
    max?: string;
  }>;
}

export default async function PropertiesPage({ searchParams }: Props) {
  const sp = await searchParams;

  const type       = sp.type === "rent" ? true : sp.type === "buy" ? false : undefined;
  const categoryId = sp.category ? Number(sp.category) : undefined;
  const cityId     = sp.city     ? Number(sp.city)     : undefined;
  const minPrice   = sp.min      ? Number(sp.min)      : undefined;
  const maxPrice   = sp.max      ? Number(sp.max)      : undefined;
  const search     = sp.q?.trim() || undefined;

  const [properties, categories, cities] = await Promise.all([
    getProperties({
      is_for_rent: type,
      category_id: categoryId,
      city_id:     cityId,
      min_price:   minPrice,
      max_price:   maxPrice,
      search,
    }),
    getCategories(),
    getCities(),
  ]);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

  return (
    <div className="bg-[#f8f9fb] min-h-screen">

      {/* ── Page header ────────────────────────────────────── */}
      <div className="bg-[var(--color-brand)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <p className="text-[var(--color-gold)] text-xs font-bold tracking-[0.22em] uppercase mb-2">
            Explore Our Listings
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white">
            {sp.type === "rent" ? "Properties for Rent"
              : sp.type === "buy" ? "Properties for Sale"
              : "All Properties"}
          </h1>
          <p className="text-white/55 text-sm mt-2">
            Dehradun · Haridwar · Rishikesh, Uttarakhand
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* ── Filters ──────────────────────────────────────── */}
        <Suspense>
          <PropertyFilters
            categories={categories}
            cities={cities}
            total={properties.length}
          />
        </Suspense>

        {/* ── Grid / empty state ───────────────────────────── */}
        {properties.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-20 text-center">
            <p className="text-5xl mb-4">🏠</p>
            <p className="text-lg font-semibold text-gray-800 mb-2">No properties found</p>
            <p className="text-gray-400 text-sm">Try adjusting your filters or check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((p) => (
              <PropertyCard key={p.id} property={p} supabaseUrl={supabaseUrl} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
