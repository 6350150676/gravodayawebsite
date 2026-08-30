import { MapPin, Navigation } from "lucide-react";
import { SectionHeading } from "@/components/public/project/SectionHeading";
import { projectIcon } from "@/lib/project-icons";
import type { ProjectLocationAdvantage } from "@/types";

export function ProjectLocationAdvantages({
  items,
  address,
}: {
  items: ProjectLocationAdvantage[];
  address?: string | null;
}) {
  if (items.length === 0) return null;

  return (
    <section className="scroll-mt-44" id="location">
      <SectionHeading
        eyebrow="Connectivity"
        title="Location Advantage"
        lead={address ?? undefined}
        icon={Navigation}
      />

      {/* Separate tiles rather than a divided table: dividers would need the
          row/column maths to work out for any number of places, and this reads
          just as cleanly at 2 entries as at 12. */}
      <div className="mt-8">
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item, i) => {
            const Icon = projectIcon(item.icon, item.place);
            return (
              <li
                key={`${item.place}-${i}`}
                className="flex h-full items-center gap-3.5 rounded-xl border border-gray-100 bg-white px-4 py-3.5 shadow-sm transition-shadow hover:shadow-md sm:px-5 sm:py-4"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-(--color-gold)/10 text-(--color-gold)">
                  <Icon size={18} strokeWidth={1.7} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-(--color-brand) wrap-break-word">
                    {item.place}
                  </p>
                  {item.distance && (
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
                      <MapPin size={11} /> {item.distance}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
