import { MessageCircle, Phone } from "lucide-react";
import { ScheduleVisitDialog } from "@/components/public/project/ScheduleVisitDialog";

interface Props {
  projectId: string;
  projectName: string;
  projectUrl: string;
  phoneDisplay: string;
  phoneTel: string;
  whatsapp: string;
}

/**
 * The closing call to action. Every button here is a real path into the
 * existing lead flow — the schedule dialog posts the inquiry server action, and
 * the call/WhatsApp links are picked up by the site-wide MetaPixelContactTracker
 * that already fires "Contact" for tel:/wa.me clicks. Nothing is wired twice.
 */
export function ProjectCTA({
  projectId,
  projectName,
  projectUrl,
  phoneDisplay,
  phoneTel,
  whatsapp,
}: Props) {
  const waHref = `https://wa.me/${whatsapp}?text=${encodeURIComponent(
    `Hi, I'd like to know more about "${projectName}".`,
  )}`;

  return (
    <section className="relative overflow-hidden rounded-3xl bg-(--color-brand) px-6 py-12 sm:px-10 sm:py-14 lg:px-14">
      {/* Decorative — behind everything, never clickable. */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-(--color-gold)/10"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-white/[0.04]"
      />

      <div className="relative mx-auto max-w-2xl text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-(--color-gold)">
          Ready when you are
        </p>
        <h2 className="mt-3 text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-4xl wrap-break-word">
          Visit {projectName} in person
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/70 sm:text-[15px]">
          Walk the site, see the layouts and get an exact, unit-level quote. Pick a slot that
          suits you — our team handles the rest.
        </p>

        <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <ScheduleVisitDialog
            projectId={projectId}
            projectUrl={projectUrl}
            projectName={projectName}
            phone={phoneTel}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-(--color-gold) px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-(--color-gold-light) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-(--color-brand)"
          />
          <a
            href={`tel:${phoneTel}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-(--color-brand)"
          >
            <Phone size={16} /> {phoneDisplay}
          </a>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-(--color-brand)"
          >
            <MessageCircle size={16} /> WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
