"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, MapPin, Building2, IndianRupee, ChevronDown } from "lucide-react";

interface Lookup { id: number; name: string; slug: string }

interface Props {
  cities: Lookup[];
  categories: Lookup[];
}

// Brackets span the live inventory (roughly ₹30 L to ₹2.1 Cr), so every option
// here can return something rather than dead-ending the buyer.
const BUDGETS = [
  { label: "Any budget",        min: "",         max: ""         },
  { label: "Under ₹50 L",       min: "",         max: "5000000"  },
  { label: "₹50 L – ₹1 Cr",     min: "5000000",  max: "10000000" },
  { label: "₹1 Cr – ₹2 Cr",     min: "10000000", max: "20000000" },
  { label: "Above ₹2 Cr",       min: "20000000", max: ""         },
];

export function HeroSearch({ cities, categories }: Props) {
  const router = useRouter();
  const [cityId, setCityId]     = useState("");
  const [categoryId, setCatId]  = useState("");
  const [budgetIdx, setBudget]  = useState(0);

  function handleSearch() {
    const params = new URLSearchParams();
    if (cityId)     params.set("city", cityId);
    if (categoryId) params.set("category", categoryId);

    const b = BUDGETS[budgetIdx];
    if (b?.min) params.set("min", b.min);
    if (b?.max) params.set("max", b.max);

    router.push(`/properties?${params.toString()}`);
  }

  return (
    <div className="bg-(--color-ivory)/95 backdrop-blur-md rounded-sm p-1.5 sm:p-2 ring-1 ring-white/25 shadow-[0_30px_80px_-24px_rgba(0,0,0,0.55)]">
      <div className="flex flex-col lg:flex-row lg:items-stretch gap-1.5 sm:gap-2">
        {/* Fields */}
        <div className="grid flex-1 grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-(--color-charcoal)/10">
          <Field icon={MapPin} label="Location">
            <select
              value={cityId}
              onChange={(e) => setCityId(e.target.value)}
              aria-label="Location"
              className={SELECT}
            >
              <option value="">Any location</option>
              {cities.map((c) => (
                <option key={c.id} value={String(c.id)}>{c.name}</option>
              ))}
            </select>
          </Field>

          <Field icon={Building2} label="Property type">
            <select
              value={categoryId}
              onChange={(e) => setCatId(e.target.value)}
              aria-label="Property type"
              className={SELECT}
            >
              <option value="">All types</option>
              {categories.map((c) => (
                <option key={c.id} value={String(c.id)}>{c.name}</option>
              ))}
            </select>
          </Field>

          <Field icon={IndianRupee} label="Budget">
            <select
              value={budgetIdx}
              onChange={(e) => setBudget(Number(e.target.value))}
              aria-label="Budget"
              className={SELECT}
            >
              {BUDGETS.map((b, i) => (
                <option key={b.label} value={i}>{b.label}</option>
              ))}
            </select>
          </Field>
        </div>

        {/* Search */}
        <button
          type="button"
          onClick={handleSearch}
          className="flex items-center justify-center gap-2.5 rounded-sm bg-(--color-forest) text-white text-xs font-semibold uppercase tracking-[0.22em] px-9 py-4 hover:bg-(--color-terracotta) transition-colors duration-300"
        >
          <Search size={16} /> Search
        </button>
      </div>
    </div>
  );
}

const SELECT =
  "mt-1 w-full appearance-none bg-transparent pr-7 text-[15px] font-medium text-(--color-charcoal) outline-none cursor-pointer";

function Field({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof MapPin;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="relative block cursor-pointer px-4 sm:px-5 py-3 transition-colors hover:bg-white/70 focus-within:bg-white">
      <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-(--color-terracotta)">
        <Icon size={12} strokeWidth={2.25} /> {label}
      </span>
      {children}
      <ChevronDown size={15} className="absolute right-4 bottom-4 text-(--color-charcoal)/40 pointer-events-none" />
    </label>
  );
}
