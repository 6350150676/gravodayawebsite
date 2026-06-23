"use client";

import { useMemo, useState } from "react";
import PropertyCard from "@/components/PropertyCard";
import { properties, cities, types } from "@/lib/properties";

export default function PropertiesPage() {
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("All");
  const [type, setType] = useState("All");

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.location.toLowerCase().includes(search.toLowerCase());
      const matchesCity = city === "All" || p.city === city;
      const matchesType = type === "All" || p.type === type;
      return matchesSearch && matchesCity && matchesType;
    });
  }, [search, city, type]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold text-brand">All Properties</h1>
      <p className="mt-2 text-gray-600">
        Browse our complete collection and filter by city or type.
      </p>

      {/* Filters */}
      <div className="mt-8 grid gap-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-gray-200 md:grid-cols-3">
        <input
          type="text"
          placeholder="Search by name or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gold focus:ring-1 focus:ring-gold"
        />
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gold focus:ring-1 focus:ring-gold"
        >
          {cities.map((c) => (
            <option key={c} value={c}>
              {c === "All" ? "All Cities" : c}
            </option>
          ))}
        </select>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gold focus:ring-1 focus:ring-gold"
        >
          {types.map((t) => (
            <option key={t} value={t}>
              {t === "All" ? "All Types" : t}
            </option>
          ))}
        </select>
      </div>

      {/* Results */}
      <p className="mt-6 text-sm text-gray-500">
        {filtered.length} propert{filtered.length === 1 ? "y" : "ies"} found
      </p>

      {filtered.length > 0 ? (
        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      ) : (
        <div className="mt-12 rounded-xl bg-white py-16 text-center text-gray-500 ring-1 ring-gray-200">
          No properties match your filters. Try adjusting your search.
        </div>
      )}
    </div>
  );
}
