import type { ProjectSpec } from "@/types";

/**
 * The quick-facts strip under the gallery — possession, total units, land area,
 * approvals. Sits in the hero's left column so a short gallery doesn't leave a
 * hole beside the (much taller) information and inquiry column.
 */
export function ProjectKeySpecs({ specs }: { specs: ProjectSpec[] }) {
  if (specs.length === 0) return null;

  return (
    <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-gray-100 bg-gray-100 shadow-sm sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {specs.map((spec, i) => (
        <div key={`${spec.label}-${i}`} className="bg-white px-4 py-3.5 sm:px-5 sm:py-4">
          <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400 wrap-break-word">
            {spec.label}
          </dt>
          <dd className="mt-1 text-sm font-bold text-(--color-brand) wrap-break-word sm:text-[15px]">
            {spec.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
