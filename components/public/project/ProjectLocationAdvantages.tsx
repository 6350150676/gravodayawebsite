import { SubHeading } from "@/components/public/project/SubHeading";
import { projectIcon } from "@/lib/project-icons";
import type { ProjectLocationAdvantage } from "@/types";

/**
 * Distances as a grid of small tiles — a place and its travel time read at a
 * glance, which is the whole point of a connectivity list.
 *
 * Tiles rather than a divided row: the list is however long the admin made it
 * (five landmarks or twenty), so it has to wrap, and hairline dividers leave
 * ragged edges the moment a row is only half full. Two across on a phone, up to
 * six on a desktop.
 */
export function ProjectLocationAdvantages({ items }: { items: ProjectLocationAdvantage[] }) {
  if (items.length === 0) return null;

  return (
    <section id="location" className="scroll-mt-32">
      <SubHeading>Location Advantage</SubHeading>

      <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {items.map((item, i) => {
          const Icon = projectIcon(item.icon, item.place);
          return (
            <li
              key={`${item.place}-${i}`}
              className="flex min-w-0 flex-col items-center rounded-xl border border-gray-100 bg-(--color-sand)/50 px-2.5 py-4 text-center"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-(--color-gold)/10">
                <Icon size={18} strokeWidth={1.6} className="text-(--color-gold)" />
              </span>
              <p className="mt-2.5 text-[13px] font-semibold leading-tight text-(--color-brand) wrap-break-word">
                {item.place}
              </p>
              {item.distance && (
                <p className="mt-1 text-xs text-gray-400 wrap-break-word">{item.distance}</p>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
