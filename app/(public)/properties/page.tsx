import type { Metadata } from "next";
import { Suspense } from "react";
import { getProperties, getCategories, getCities } from "@/lib/queries/properties";
import type { PropertySort } from "@/types";
import { PropertyCard } from "@/components/public/PropertyCard";
import { PropertyFilters } from "@/components/public/PropertyFilters";
import { SortSelect } from "@/components/public/SortSelect";
import { Reveal } from "@/components/public/Reveal";

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
    sort?: string;
  }>;
}

const VALID_SORTS: PropertySort[] = ["price_asc", "price_desc"];

export default async function PropertiesPage({ searchParams }: Props) {
  const sp = await searchParams;

  const type       = sp.type === "rent" ? true : sp.type === "buy" ? false : undefined;
  const categoryId = sp.category ? Number(sp.category) : undefined;
  const cityId     = sp.city     ? Number(sp.city)     : undefined;
  const minPrice   = sp.min      ? Number(sp.min)      : undefined;
  const maxPrice   = sp.max      ? Number(sp.max)      : undefined;
  const search     = sp.q?.trim() || undefined;
  const sort       = VALID_SORTS.includes(sp.sort as PropertySort) ? (sp.sort as PropertySort) : undefined;

  const [properties, categories, cities] = await Promise.all([
    getProperties({
      is_for_rent: type,
      category_id: categoryId,
      city_id:     cityId,
      min_price:   minPrice,
      max_price:   maxPrice,
      search,
      sort,
    }),
    getCategories(),
    getCities(),
  ]);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

  return (
    <div className="bg-[var(--color-sand)] min-h-screen">

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">

          {/* ── Filter sidebar ─────────────────────────────── */}
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <Suspense>
              <PropertyFilters
                categories={categories}
                cities={cities}
                total={properties.length}
              />
            </Suspense>
          </aside>

          {/* ── Results column ─────────────────────────────── */}
          <section className="min-w-0">

            {/* Results toolbar */}
            <div className="flex items-center justify-between gap-3 bg-white rounded-2xl shadow-sm border border-gray-100 px-4 sm:px-5 py-3 mb-5">
              <p className="text-sm text-gray-500">
                <strong className="text-[var(--color-brand)]">{properties.length}</strong>{" "}
                {properties.length === 1 ? "property" : "properties"} found
              </p>
              <Suspense>
                <SortSelect />
              </Suspense>
            </div>

            {/* Grid / empty state */}
            {properties.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-20 text-center">
                <p className="text-5xl mb-4">🏠</p>
                <p className="text-lg font-semibold text-gray-800 mb-2">No properties found</p>
                <p className="text-gray-400 text-sm">Try adjusting your filters or check back soon.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {properties.map((p, i) => (
                  <Reveal key={p.id} delay={Math.min(i, 4) * 70}>
                    <PropertyCard property={p} supabaseUrl={supabaseUrl} layout="horizontal" />
                  </Reveal>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
