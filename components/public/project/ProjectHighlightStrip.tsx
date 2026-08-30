import { projectIcon } from "@/lib/project-icons";
import type { ProjectHighlight } from "@/types";

/**
 * The icon row under the lead paragraph. One cell per highlight the admin has
 * entered, and the column count follows how many there are — four fill a row,
 * six wrap to two rows of three, and one sits on its own.
 */
function columnsFor(count: number): string {
  if (count === 1) return "sm:grid-cols-1";
  if (count === 2) return "sm:grid-cols-2";
  if (count === 3 || count === 6 || count === 9) return "sm:grid-cols-3";
  return "sm:grid-cols-2 lg:grid-cols-4";
}

export function ProjectHighlightStrip({ highlights }: { highlights: ProjectHighlight[] }) {
  if (highlights.length === 0) return null;

  return (
    <div
      className={`grid grid-cols-1 gap-x-6 gap-y-5 rounded-xl border border-gray-100 bg-(--color-sand)/50 px-5 py-5 ${columnsFor(
        highlights.length,
      )}`}
    >
      {highlights.map((h, i) => {
        const Icon = projectIcon(h.icon, `${h.title} ${h.description}`);
        return (
          <div
            key={`${h.title}-${i}`}
            className="flex items-center gap-3"
          >
            <Icon size={30} strokeWidth={1.3} className="shrink-0 text-(--color-brand)" />
            <div className="min-w-0">
              <p className="text-[15px] font-bold leading-tight text-(--color-brand) wrap-break-word">
                {h.title}
              </p>
              {h.description && (
                <p className="mt-0.5 text-xs leading-snug text-gray-500 wrap-break-word">
                  {h.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
