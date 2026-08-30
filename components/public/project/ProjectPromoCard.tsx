import Image from "next/image";
import { BadgeCheck, Headset, ShieldCheck } from "lucide-react";
import { ScheduleVisitDialog } from "@/components/public/project/ScheduleVisitDialog";
import type { ProjectWithRelations } from "@/types";

/**
 * The closing call to action, sat beside the payment plan. Everything variable
 * comes from the project itself — its name, its tagline and one of its uploaded
 * images — so this never needs editing in code when a new project is added.
 *
 * `h-full` matters: this sits next to a payment card whose height depends
 * entirely on how many configurations the admin entered, and the image stretches
 * to whatever that turns out to be.
 */
export function ProjectPromoCard({
  project,
  projectUrl,
  imageUrl,
  subline,
  phoneTel,
}: {
  project: ProjectWithRelations;
  projectUrl: string;
  imageUrl: string | null;
  /** The project's tagline, when it has one. */
  subline?: string | null;
  phoneTel: string;
}) {
  return (
    <section className="relative flex h-full min-h-[300px] flex-col justify-between overflow-hidden rounded-2xl bg-(--color-brand) p-6 sm:p-8 lg:min-h-[340px] lg:p-10">
      {imageUrl && (
        <>
          <Image
            src={imageUrl}
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 700px"
            className="object-cover"
          />
          {/* Two scrims rather than one: the left keeps the heading legible
              over any photograph, the bottom does the same for the badges,
              and between them the photo still reads as a photo. */}
          <div className="absolute inset-0 bg-gradient-to-r from-(--color-brand) via-(--color-brand)/85 to-(--color-brand)/25" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-(--color-brand)/85 to-transparent" />
        </>
      )}

      <div className="relative max-w-lg">
        <h2 className="text-2xl font-bold leading-tight text-white sm:text-3xl wrap-break-word">
          Visit {project.name} in person
        </h2>
        {subline && (
          <p className="mt-2 text-sm leading-relaxed text-white/75 wrap-break-word">{subline}</p>
        )}
        <ScheduleVisitDialog
          projectId={project.id}
          projectUrl={projectUrl}
          projectName={project.name}
          phone={phoneTel}
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-(--color-gold) px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-(--color-gold-light) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-(--color-brand)"
        />
      </div>

      <div className="relative mt-8 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/15 pt-5">
        <Badge icon={BadgeCheck} text="Verified project" />
        {/* Only claims RERA when the admin has entered a number. */}
        {project.rera_number && <Badge icon={ShieldCheck} text="RERA registered" />}
        <Badge icon={Headset} text="Expert support" />
      </div>
    </section>
  );
}

function Badge({ icon: Icon, text }: { icon: typeof BadgeCheck; text: string }) {
  return (
    <span className="flex items-center gap-2 text-xs font-semibold text-white/85">
      <Icon size={16} className="text-(--color-gold)" />
      {text}
    </span>
  );
}
