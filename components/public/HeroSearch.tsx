"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, MapPin, Building2, IndianRupee, ChevronDown } from "lucide-react";

interface Lookup { id: number; name: string; slug: string }

interface Props {
  cities: Lookup[];
  categories: Lookup[];
}

const TABS = [
  { label: "Buy", value: "buy" },
  { label: "Rent", value: "rent" },
  { label: "Commercial", value: "commercial" },
] as const;

type TabValue = (typeof TABS)[number]["value"];

const BUDGETS: Record<"buy" | "rent", { label: string; min: string; max: string }[]> = {
  buy: [
    { label: "Budget (any)",      min: "",         max: ""         },
    { label: "Under ₹50 L",       min: "",         max: "5000000"  },
    { label: "₹50 L – ₹1 Cr",     min: "5000000",  max: "10000000" },
    { label: "₹1 Cr – ₹2 Cr",     min: "10000000", max: "20000000" },
    { label: "Above ₹2 Cr",       min: "20000000", max: ""         },
  ],
  rent: [
    { label: "Budget (any)",      min: "",      max: ""      },
    { label: "Under ₹15,000",     min: "",      max: "15000" },
    { label: "₹15k – ₹30k",       min: "15000", max: "30000" },
    { label: "₹30k – ₹60k",       min: "30000", max: "60000" },
    { label: "Above ₹60k",        min: "60000", max: ""      },
  ],
};

export function HeroSearch({ cities, categories }: Props) {
  const router = useRouter();
  const [tab, setTab]           = useState<TabValue>("buy");
  const [cityId, setCityId]     = useState("");
  const [categoryId, setCatId]  = useState("");
  const [budgetIdx, setBudget]  = useState(0);

  const budgetKey = tab === "rent" ? "rent" : "buy";
  const budgetOpts = BUDGETS[budgetKey];

  const commercialCat = categories.find((c) => /commercial|office|shop|retail/i.test(c.name));

  function handleSearch() {
    const params = new URLSearchParams();
    if (tab === "buy") params.set("type", "buy");
    else if (tab === "rent") params.set("type", "rent");

    let cat = categoryId;
    if (tab === "commercial" && !cat && commercialCat) cat = String(commercialCat.id);

    if (cityId) params.set("city", cityId);
    if (cat)    params.set("category", cat);

    const b = budgetOpts[budgetIdx];
    if (b?.min) params.set("min", b.min);
    if (b?.max) params.set("max", b.max);

    router.push(`/properties?${params.toString()}`);
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 p-2.5 sm:p-3">
      {/* Tabs */}
      <div className="flex gap-1 px-1 pb-2.5">
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => { setTab(t.value); setBudget(0); }}
            aria-pressed={tab === t.value}
            className={`px-4 sm:px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
              tab === t.value
                ? "bg-[var(--color-brand)] text-white shadow-sm"
                : "text-gray-500 hover:text-[var(--color-brand)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.3fr_1.1fr_1fr_auto] gap-2">
        {/* Location */}
        <Field icon={MapPin}>
          <select
            value={cityId}
            onChange={(e) => setCityId(e.target.value)}
            aria-label="Location"
            className="w-full appearance-none bg-transparent pl-9 pr-8 py-3 text-sm font-medium text-gray-800 outline-none cursor-pointer"
          >
            <option value="">All of Uttarakhand</option>
            {cities.map((c) => (
              <option key={c.id} value={String(c.id)}>{c.name}</option>
            ))}
          </select>
        </Field>

        {/* Property type */}
        <Field icon={Building2}>
          <select
            value={categoryId}
            onChange={(e) => setCatId(e.target.value)}
            aria-label="Property type"
            className="w-full appearance-none bg-transparent pl-9 pr-8 py-3 text-sm font-medium text-gray-800 outline-none cursor-pointer"
          >
            <option value="">Property type</option>
            {categories.map((c) => (
              <option key={c.id} value={String(c.id)}>{c.name}</option>
            ))}
          </select>
        </Field>

        {/* Budget */}
        <Field icon={IndianRupee}>
          <select
            value={budgetIdx}
            onChange={(e) => setBudget(Number(e.target.value))}
            aria-label="Budget"
            className="w-full appearance-none bg-transparent pl-9 pr-8 py-3 text-sm font-medium text-gray-800 outline-none cursor-pointer"
          >
            {budgetOpts.map((b, i) => (
              <option key={b.label} value={i}>{b.label}</option>
            ))}
          </select>
        </Field>

        {/* Search */}
        <button
          type="button"
          onClick={handleSearch}
          className="flex items-center justify-center gap-2 bg-[var(--color-royal)] text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-[var(--color-royal-dark)] transition-colors shadow-sm"
        >
          <Search size={17} /> Search
        </button>
      </div>
    </div>
  );
}

function Field({ icon: Icon, children }: { icon: typeof MapPin; children: React.ReactNode }) {
  return (
    <div className="relative rounded-xl border border-gray-200 bg-gray-50 focus-within:border-[var(--color-royal)] focus-within:ring-2 focus-within:ring-[var(--color-royal)]/15 transition-colors">
      <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-gold)] pointer-events-none" />
      {children}
      <ChevronDown size={15} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  );
}
