import { Sparkles } from "lucide-react";
import { SectionHeading } from "@/components/public/project/SectionHeading";
import { projectIcon } from "@/lib/project-icons";
import type { ProjectHighlight } from "@/types";

/**
 * Column count follows the number of highlights: 4 become a balanced 2x2 rather
 * than one cramped row, and anything larger runs 3 across. Three is the ceiling
 * because these sit in the content column, not the full page width — a 4-across
 * row here would be ~200px per card.
 */
function gridFor(count: number): string {
  if (count === 1) return "grid-cols-1 max-w-md";
  if (count === 2) return "grid-cols-1 sm:grid-cols-2 max-w-3xl";
  // Prefer the row length that leaves the fewest orphans on the last row:
  // 6 highlights read better as 3+3 than 4+2, and 8 as 4+4 than 3+3+2.
  if (count % 3 === 0) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
  return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
}

export function ProjectHighlights({
  highlights,
  projectName,
}: {
  highlights: ProjectHighlight[];
  projectName: string;
}) {
  if (highlights.length === 0) return null;

  return (
    <section className="scroll-mt-44" id="highlights">
      <SectionHeading
        eyebrow="Why this project"
        title="Key Highlights"
        lead={`What sets ${projectName} apart.`}
        icon={Sparkles}
      />

      <div className={`mt-8 grid gap-4 sm:gap-5 ${gridFor(highlights.length)}`}>
        {highlights.map((h, i) => {
          const Icon = projectIcon(h.icon, `${h.title} ${h.description}`);
          return (
            <div
              key={`${h.title}-${i}`}
              className="group relative h-full overflow-hidden rounded-2xl border border-gray-100 bg-(--color-ivory) p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              {/* Decorative wash — sits behind the content, never intercepts taps. */}
              <span
                aria-hidden
                className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-(--color-gold)/8 transition-transform duration-500 group-hover:scale-125"
              />
              <span className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-(--color-brand)/8 text-(--color-brand) transition-colors group-hover:bg-(--color-brand) group-hover:text-white">
                <Icon size={22} strokeWidth={1.6} />
              </span>
              <h3 className="relative mt-4 text-base font-bold text-(--color-brand) wrap-break-word">
                {h.title}
              </h3>
              {h.description && (
                <p className="relative mt-2 text-sm leading-relaxed text-gray-500 wrap-break-word">
                  {h.description}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
