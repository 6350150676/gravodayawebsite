"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition } from "react";
import { Search, SlidersHorizontal } from "lucide-react";

interface Lookup { id: number; name: string; slug: string }

interface Props {
  categories: Lookup[];
  cities: Lookup[];
  total: number;
}

const TYPE_TABS = [
  { label: "All",  value: ""     },
  { label: "Buy",  value: "buy"  },
  { label: "Rent", value: "rent" },
];

export function PropertyFilters({ categories, cities, total }: Props) {
  const router   = useRouter();
  const pathname = usePathname();
  const params   = useSearchParams();
  const [, startTransition] = useTransition();

  const current = useCallback(
    (key: string) => params.get(key) ?? "",
    [params],
  );

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page"); // reset pagination on filter change
    startTransition(() => router.push(`${pathname}?${next.toString()}`));
  }

  const hasFilters = ["type","category","city","q","min","max"].some((k) => params.get(k));

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 space-y-4">

      {/* Row 1: search + count */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by title, area…"
            defaultValue={current("q")}
            onKeyDown={(e) => { if (e.key === "Enter") update("q", (e.target as HTMLInputElement).value); }}
            onBlur={(e) => update("q", e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/15 bg-gray-50"
          />
        </div>
        <div className="flex items-center gap-1.5 text-gray-400 text-sm whitespace-nowrap flex-shrink-0">
          <SlidersHorizontal size={14} />
          <span><strong className="text-gray-700">{total}</strong> {total === 1 ? "property" : "properties"}</span>
        </div>
      </div>

      {/* Row 2: type tabs + dropdowns */}
      <div className="flex flex-wrap items-center gap-3">

        {/* Type tabs */}
        <div className="flex bg-gray-100 rounded-xl p-1 gap-0.5">
          {TYPE_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => update("type", tab.value)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                current("type") === tab.value
                  ? "bg-[var(--color-brand)] text-white shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Category */}
        <select
          value={current("category")}
          onChange={(e) => update("category", e.target.value)}
          className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 outline-none focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/15 cursor-pointer"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={String(c.id)}>{c.name}</option>
          ))}
        </select>

        {/* City */}
        <select
          value={current("city")}
          onChange={(e) => update("city", e.target.value)}
          className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 outline-none focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/15 cursor-pointer"
        >
          <option value="">All Cities</option>
          {cities.map((c) => (
            <option key={c.id} value={String(c.id)}>{c.name}</option>
          ))}
        </select>

        {/* Price range */}
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            placeholder="Min ₹"
            defaultValue={current("min")}
            onBlur={(e) => update("min", e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") update("min", (e.target as HTMLInputElement).value); }}
            className="w-24 text-sm border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 outline-none focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/15"
          />
          <span className="text-gray-400 text-xs">–</span>
          <input
            type="number"
            placeholder="Max ₹"
            defaultValue={current("max")}
            onBlur={(e) => update("max", e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") update("max", (e.target as HTMLInputElement).value); }}
            className="w-24 text-sm border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 outline-none focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/15"
          />
        </div>

        {/* Clear */}
        {hasFilters && (
          <button
            onClick={() => startTransition(() => router.push(pathname))}
            className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors ml-auto"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
