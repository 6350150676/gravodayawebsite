import { BadgeCheck, FileText, MapPin, MessageCircle, Phone, ShieldCheck } from "lucide-react";
import { ScheduleVisitDialog } from "@/components/public/project/ScheduleVisitDialog";
import type { ProjectWithRelations } from "@/types";

interface Props {
  project: ProjectWithRelations;
  projectUrl: string;
  priceRange: string | null;
  categories: string[];
  phoneDisplay: string;
  phoneTel: string;
  whatsapp: string;
}

/**
 * The hero's right-hand card: identity, price and the ways to get in touch.
 *
 * It is `h-full` with the actions pushed down by `mt-auto`, so it always ends
 * exactly level with the gallery beside it no matter how much the project has
 * filled in. That is the whole trick to this row — a card sized by its content
 * is either shorter than the gallery (a hole under the card) or taller (a hole
 * under the gallery), and which one you get depends on the project's data.
 *
 * The full inquiry form is deliberately not here. It is ~600px tall, and putting
 * it in this row is what made the first version's columns impossible to balance.
 */
export function ProjectHeroCard({
  project,
  projectUrl,
  priceRange,
  categories,
  phoneDisplay,
  phoneTel,
  whatsapp,
}: Props) {
  const address = [project.location, project.city?.name].filter(Boolean).join(", ");
  const waHref = `https://wa.me/${whatsapp}?text=${encodeURIComponent(
    `Hi, I'm interested in "${project.name}".`,
  )}`;

  return (
    <div className="flex h-full flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-7">
      {(project.is_featured || categories.length > 0) && (
        <div className="mb-3.5 flex flex-wrap gap-1.5">
          {project.is_featured && (
            <span className="rounded-full bg-(--color-gold) px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
              Featured
            </span>
          )}
          {categories.map((name) => (
            <span
              key={name}
              className="rounded-full bg-(--color-brand)/8 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-(--color-brand)"
            >
              {name}
            </span>
          ))}
        </div>
      )}

      <h1 className="text-2xl font-bold leading-tight text-(--color-brand) sm:text-[28px] wrap-break-word">
        {project.name}
      </h1>

      {project.tagline && (
        <p className="mt-2 text-[15px] leading-relaxed text-gray-500 wrap-break-word">
          {project.tagline}
        </p>
      )}

      {address && (
        <p className="mt-3 flex items-start gap-1.5 text-sm text-gray-500">
          <MapPin size={15} className="mt-0.5 shrink-0 text-(--color-gold)" />
          <span className="wrap-break-word">{address}</span>
        </p>
      )}

      {priceRange && (
        <div className="mt-5 rounded-xl bg-(--color-sand) px-4 py-3.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-400">
            Price Range
          </p>
          <p className="mt-1 text-2xl font-bold text-(--color-brand) wrap-break-word">
            {priceRange}
          </p>
          <p className="mt-0.5 text-[11px] text-gray-400">Indicative — varies by unit and plan.</p>
        </div>
      )}

      {/* Everything below is pinned to the bottom of whatever height the row
          settles on, which is what keeps this level with the gallery. */}
      <div className="mt-auto space-y-2.5 pt-6">
        <ScheduleVisitDialog
          projectId={project.id}
          projectUrl={projectUrl}
          projectName={project.name}
          phone={phoneTel}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-(--color-brand) px-4 py-3.5 text-sm font-bold text-white transition-colors hover:bg-(--color-brand-light) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-brand) focus-visible:ring-offset-2"
        />

        <div className="grid grid-cols-2 gap-2.5">
          <a
            href={`tel:${phoneTel}`}
            className="flex items-center justify-center gap-2 rounded-xl border border-(--color-royal)/40 px-3 py-3 text-sm font-semibold text-(--color-royal) transition-colors hover:bg-(--color-royal)/5"
          >
            <Phone size={15} /> Call
          </a>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-3 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-700"
          >
            <MessageCircle size={15} /> WhatsApp
          </a>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 pt-1">
          <a
            href="#enquire"
            className="text-xs font-bold text-(--color-brand) underline-offset-4 hover:text-(--color-gold) hover:underline"
          >
            Send an inquiry
          </a>
          {project.brochure_url && (
            <a
              href={project.brochure_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-(--color-brand) underline-offset-4 hover:text-(--color-gold) hover:underline"
            >
              <FileText size={13} /> Brochure
            </a>
          )}
        </div>

        <div className="space-y-2 border-t border-gray-100 pt-4">
          {/* Only claim RERA registration when the admin has entered a number. */}
          {project.rera_number && (
            <TrustRow icon={ShieldCheck} text={`RERA · ${project.rera_number}`} />
          )}
          <TrustRow icon={BadgeCheck} text="No brokerage, transparent pricing" />
          <TrustRow icon={Phone} text={phoneDisplay} />
        </div>
      </div>
    </div>
  );
}

function TrustRow({ icon: Icon, text }: { icon: typeof ShieldCheck; text: string }) {
  return (
    <div className="flex items-center gap-2.5 text-xs text-gray-500">
      <Icon size={14} className="shrink-0 text-(--color-brand)/60" />
      <span className="wrap-break-word">{text}</span>
    </div>
  );
}
