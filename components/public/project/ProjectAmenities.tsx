import { Check, LayoutGrid } from "lucide-react";
import { SectionHeading } from "@/components/public/project/SectionHeading";
import { projectIcon } from "@/lib/project-icons";
import type { ProjectAmenityGroup } from "@/types";

/**
 * One card per amenity category. Two categories get two wide cards rather than
 * two narrow ones stranded beside empty space; four or more run three across,
 * which is as narrow as a card holding a list should get.
 */
function gridFor(count: number): string {
  if (count === 1) return "grid-cols-1";
  if (count === 2 || count === 4) return "grid-cols-1 md:grid-cols-2";
  return "grid-cols-1 md:grid-cols-2 xl:grid-cols-3";
}

export function ProjectAmenities({ groups }: { groups: ProjectAmenityGroup[] }) {
  if (groups.length === 0) return null;

  const total = groups.reduce((sum, g) => sum + g.items.length, 0);

  return (
    <section className="scroll-mt-44" id="amenities">
      <SectionHeading
        eyebrow="Lifestyle"
        title="Amenities"
        lead={`${total} curated ${total === 1 ? "amenity" : "amenities"} across ${groups.length} ${
          groups.length === 1 ? "category" : "categories"
        }.`}
        icon={LayoutGrid}
      />

      <div className={`mt-8 grid gap-5 ${gridFor(groups.length)}`}>
        {groups.map((group, i) => {
          const Icon = projectIcon(group.icon, group.title);
          return (
            <div
              key={`${group.title}-${i}`}
              className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
            >
              <header className="flex items-center gap-3 border-b border-gray-100 bg-(--color-brand)/[0.04] px-5 py-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-(--color-brand) text-white">
                  <Icon size={18} strokeWidth={1.7} />
                </span>
                <div className="min-w-0">
                  <h3 className="text-[15px] font-bold text-(--color-brand) wrap-break-word">
                    {group.title}
                  </h3>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                    {group.items.length} {group.items.length === 1 ? "feature" : "features"}
                  </p>
                </div>
              </header>

              <ul className="grid flex-1 grid-cols-1 gap-x-6 gap-y-2.5 px-5 py-5 sm:grid-cols-2 xl:grid-cols-1">
                {group.items.map((item, j) => (
                  <li key={`${item}-${j}`} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <span className="mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-(--color-gold)/15">
                      <Check size={11} strokeWidth={3} className="text-(--color-gold)" />
                    </span>
                    <span className="leading-relaxed wrap-break-word">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
