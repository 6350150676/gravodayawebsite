import { MapPin } from "lucide-react";
import type { ProjectSpec, ProjectWithRelations } from "@/types";

/**
 * Sits directly under the gallery, in the hero's left column. Keeping the name
 * and price here (rather than in the right-hand card) is what balances the two
 * columns: gallery + title on the left comes out level with form + trust on the
 * right, so neither side ends early.
 */
export function ProjectTitleBlock({
  project,
  priceRange,
  specs,
  categories,
}: {
  project: ProjectWithRelations;
  priceRange: string | null;
  specs: ProjectSpec[];
  /** Property-type names ticked for this project in the admin panel. */
  categories: string[];
}) {
  const address = [project.location, project.city?.name].filter(Boolean).join(", ");

  return (
    <div className="mt-6">
      {(project.is_featured || categories.length > 0) && (
        <div className="flex flex-wrap items-center gap-2">
          {project.is_featured && (
            <span className="rounded bg-(--color-gold) px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
              Featured Project
            </span>
          )}
          {/* The types this project sells, exactly as ticked in the admin panel. */}
          {categories.map((name) => (
            <span
              key={name}
              className="rounded border border-(--color-brand)/15 bg-(--color-brand)/5 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-(--color-brand)"
            >
              {name}
            </span>
          ))}
        </div>
      )}

      <h1 className="mt-3 text-3xl font-bold leading-tight text-(--color-brand) sm:text-4xl wrap-break-word">
        {project.name}
      </h1>

      {address && (
        <p className="mt-2.5 flex items-start gap-1.5 text-[15px] text-gray-600">
          <MapPin size={16} className="mt-0.5 shrink-0 text-(--color-gold)" />
          <span className="wrap-break-word">{address}</span>
        </p>
      )}

      {priceRange && (
        <div className="mt-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-400">
            Price Range
          </p>
          <p className="mt-1 text-3xl font-bold text-(--color-brand) wrap-break-word">
            {priceRange}
            <span className="align-super text-lg text-(--color-gold)">*</span>
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Indicative range. Visit for exact price plan.
          </p>
        </div>
      )}

      {specs.length > 0 && (
        <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-3">
          {specs.map((spec, i) => (
            <div key={`${spec.label}-${i}`}>
              <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
                {spec.label}
              </dt>
              <dd className="mt-0.5 text-sm font-bold text-(--color-brand)">{spec.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
