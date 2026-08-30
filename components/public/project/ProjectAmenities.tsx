import { SubHeading } from "@/components/public/project/SubHeading";
import { projectIcon } from "@/lib/project-icons";
import type { ProjectAmenityGroup } from "@/types";

/**
 * Amenity categories as parallel columns — a badge and title at the top of
 * each, then its list. Four across at most; fewer categories take fewer
 * columns rather than stretching to fill, which keeps the list measure
 * readable. Every label and item comes from the admin panel.
 */
function columnsFor(count: number): string {
  if (count === 1) return "sm:grid-cols-1";
  if (count === 2) return "sm:grid-cols-2";
  if (count === 3) return "sm:grid-cols-2 lg:grid-cols-3";
  return "sm:grid-cols-2 lg:grid-cols-4";
}

export function ProjectAmenities({ groups }: { groups: ProjectAmenityGroup[] }) {
  if (groups.length === 0) return null;

  return (
    <section id="amenities" className="scroll-mt-32">
      <SubHeading>Amenities</SubHeading>

      <div className={`grid grid-cols-1 gap-x-8 gap-y-8 ${columnsFor(groups.length)}`}>
        {groups.map((group, i) => {
          const Icon = projectIcon(group.icon, group.title);
          return (
            <div key={`${group.title}-${i}`} className="min-w-0">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-(--color-brand)">
                  <Icon size={16} strokeWidth={1.7} className="text-(--color-gold)" />
                </span>
                <h3 className="text-[15px] font-bold text-(--color-brand) wrap-break-word">
                  {group.title}
                </h3>
              </div>

              {/* A category with a long list would otherwise run far past its
                  neighbours; on a wide screen it splits into two columns and
                  the row of categories stays roughly level. */}
              <ul
                className={`mt-3.5 space-y-2 ${
                  group.items.length > 12 && groups.length <= 2 ? "sm:columns-2 sm:gap-x-8 sm:space-y-0" : ""
                }`}
              >
                {group.items.map((item, j) => (
                  <li
                    key={`${item}-${j}`}
                    className="flex items-start gap-2 break-inside-avoid py-1 text-[13px] leading-relaxed text-gray-600"
                  >
                    <span
                      aria-hidden
                      className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-(--color-gold)"
                    />
                    <span className="wrap-break-word">{item}</span>
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
