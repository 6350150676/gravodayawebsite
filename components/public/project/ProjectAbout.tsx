import { Building2, ChevronDown, ChevronUp, FileText } from "lucide-react";
import { ProjectRichText } from "@/components/public/ProjectRichText";
import { SectionHeading } from "@/components/public/project/SectionHeading";

// Descriptions on these projects run to a couple of thousand characters of
// headings and bullet lists. Dropping all of it on the page at once is the
// single biggest reason the page felt like a wall of text, so anything past
// roughly a screenful is collapsed behind a "Read more".
const CLAMP_ABOVE_CHARS = 1200;

/**
 * "About the project" — the long description, formatted by ProjectRichText
 * (which turns ALL-CAPS lines into headings and "- " lines into an icon list).
 *
 * The expand/collapse is a checkbox and two labels, not a client component:
 * it costs no JavaScript, works before hydration, and keeps this a server
 * component so the text is in the initial HTML.
 */
export function ProjectAbout({
  projectName,
  overview,
  description,
  brochureUrl,
}: {
  projectName: string;
  /** The admin's short overview, shown as the lead. Omitted when not set. */
  overview?: string | null;
  description: string;
  brochureUrl?: string | null;
}) {
  const clamp = description.length > CLAMP_ABOVE_CHARS;

  return (
    <section className="scroll-mt-44" id="about">
      <SectionHeading eyebrow="Overview" title={`About ${projectName}`} icon={Building2} />

      <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
        {overview && (
          <p className="mb-6 border-l-2 border-(--color-gold) pl-4 text-base leading-relaxed text-gray-600 wrap-break-word">
            {overview}
          </p>
        )}

        {clamp ? (
          <div className="relative">
            <input id="project-about-full" type="checkbox" className="peer sr-only" />

            <div className="max-h-96 overflow-hidden peer-checked:max-h-none">
              <ProjectRichText text={description} />
            </div>

            {/* Fade over the cut, so the clamp reads as "more below" rather
                than as text that got chopped. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-72 h-24 bg-gradient-to-b from-transparent to-white peer-checked:hidden"
            />

            <label
              htmlFor="project-about-full"
              className="mt-5 inline-flex cursor-pointer items-center gap-1.5 rounded-lg text-sm font-bold text-(--color-brand) hover:text-(--color-gold) peer-checked:hidden peer-focus-visible:ring-2 peer-focus-visible:ring-(--color-brand) peer-focus-visible:ring-offset-2"
            >
              Read more <ChevronDown size={15} />
            </label>
            <label
              htmlFor="project-about-full"
              className="mt-5 hidden cursor-pointer items-center gap-1.5 rounded-lg text-sm font-bold text-(--color-brand) hover:text-(--color-gold) peer-checked:inline-flex peer-focus-visible:ring-2 peer-focus-visible:ring-(--color-brand) peer-focus-visible:ring-offset-2"
            >
              Show less <ChevronUp size={15} />
            </label>
          </div>
        ) : (
          <ProjectRichText text={description} />
        )}

        {brochureUrl && (
          <a
            href={brochureUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-(--color-brand)/5 px-5 py-3 text-sm font-semibold text-(--color-brand) transition-colors hover:bg-(--color-brand) hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-brand) focus-visible:ring-offset-2"
          >
            <FileText size={15} /> Download Brochure
          </a>
        )}
      </div>
    </section>
  );
}
