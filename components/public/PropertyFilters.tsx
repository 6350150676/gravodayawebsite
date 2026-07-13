"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";

interface Lookup { id: number; name: string; slug: string }

interface Props {
  categories: Lookup[];
  cities: Lookup[];
  total: number;
}

export function PropertyFilters({ categories, cities, total }: Props) {
  const router   = useRouter();
  const pathname = usePathname();
  const params   = useSearchParams();
  const [, startTransition] = useTransition();
  const [open, setOpen] = useState(false); // mobile drawer

  const current = useCallback((key: string) => params.get(key) ?? "", [params]);

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    startTransition(() => router.push(`${pathname}?${next.toString()}`));
  }

  const hasFilters = ["category", "city", "q", "min", "max", "sort"].some((k) => params.get(k));

  // Active filter chips
  const chips: { key: string; label: string }[] = [];
  if (current("category")) {
    const name = categories.find((c) => String(c.id) === current("category"))?.name;
    if (name) chips.push({ key: "category", label: name });
  }
  if (current("city")) {
    const name = cities.find((c) => String(c.id) === current("city"))?.name;
    if (name) chips.push({ key: "city", label: name });
  }
  if (current("q"))   chips.push({ key: "q", label: `“${current("q")}”` });
  if (current("min")) chips.push({ key: "min", label: `Min ₹${Number(current("min")).toLocaleString("en-IN")}` });
  if (current("max")) chips.push({ key: "max", label: `Max ₹${Number(current("max")).toLocaleString("en-IN")}` });

  return (
    <div>
      {/* Mobile toggle */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="lg:hidden w-full flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3 mb-3 text-sm font-semibold text-gray-700 shadow-sm"
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-[var(--color-royal)]" />
          Filters{chips.length > 0 && <span className="text-[var(--color-royal)]">· {chips.length}</span>}
        </span>
        <ChevronDown size={16} className={`text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <div className={`${open ? "block" : "hidden"} lg:block bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-5`}>

        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-bold text-[var(--color-brand)]">
            <SlidersHorizontal size={15} /> Filters
          </h2>
          {hasFilters && (
            <button
              type="button"
              onClick={() => startTransition(() => router.push(pathname))}
              className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Active chips */}
        {chips.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {chips.map((chip) => (
              <button
                type="button"
                key={chip.key}
                aria-label={`Remove filter ${chip.label}`}
                onClick={() => update(chip.key, "")}
                className="group inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-royal)] bg-[var(--color-royal)]/10 hover:bg-[var(--color-royal)]/20 px-2.5 py-1 rounded-full transition-colors"
              >
                {chip.label}
                <X size={12} className="text-gray-400 group-hover:text-red-500 transition-colors" />
              </button>
            ))}
          </div>
        )}

        {/* Search */}
        <Section label="Search">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              aria-label="Search by title or area"
              placeholder="Title, area…"
              defaultValue={current("q")}
              onKeyDown={(e) => { if (e.key === "Enter") update("q", (e.target as HTMLInputElement).value.trim()); }}
              onBlur={(e) => update("q", e.target.value.trim())}
              className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-[var(--color-royal)] focus:ring-2 focus:ring-[var(--color-royal)]/15 bg-gray-50"
            />
          </div>
        </Section>

        {/* Property type */}
        <Section label="Property type">
          <SelectField
            value={current("category")}
            onChange={(v) => update("category", v)}
            ariaLabel="Filter by category"
            placeholder="All categories"
            options={categories}
          />
        </Section>

        {/* City */}
        <Section label="City">
          <SelectField
            value={current("city")}
            onChange={(v) => update("city", v)}
            ariaLabel="Filter by city"
            placeholder="All cities"
            options={cities}
          />
        </Section>

        {/* Budget */}
        <Section label="Budget (₹)">
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              step="50000"
              aria-label="Minimum price"
              placeholder="Min"
              defaultValue={current("min")}
              onBlur={(e) => update("min", e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") update("min", (e.target as HTMLInputElement).value); }}
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 outline-none focus:border-[var(--color-royal)] focus:ring-2 focus:ring-[var(--color-royal)]/15"
            />
            <span className="text-gray-300">–</span>
            <input
              type="number"
              min="0"
              step="50000"
              aria-label="Maximum price"
              placeholder="Max"
              defaultValue={current("max")}
              onBlur={(e) => update("max", e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") update("max", (e.target as HTMLInputElement).value); }}
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 outline-none focus:border-[var(--color-royal)] focus:ring-2 focus:ring-[var(--color-royal)]/15"
            />
          </div>
        </Section>

        <p className="text-xs text-gray-400 pt-1 border-t border-gray-100">
          <strong className="text-gray-700">{total}</strong> {total === 1 ? "property" : "properties"} match
        </p>
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">{label}</p>
      {children}
    </div>
  );
}

function SelectField({
  value, onChange, ariaLabel, placeholder, options,
}: {
  value: string;
  onChange: (v: string) => void;
  ariaLabel: string;
  placeholder: string;
  options: Lookup[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        aria-label={ariaLabel}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none text-sm border border-gray-200 rounded-xl pl-3 pr-9 py-2.5 bg-gray-50 outline-none focus:border-[var(--color-royal)] focus:ring-2 focus:ring-[var(--color-royal)]/15 cursor-pointer"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.id} value={String(o.id)}>{o.name}</option>
        ))}
      </select>
      <ChevronDown size={15} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  );
}
