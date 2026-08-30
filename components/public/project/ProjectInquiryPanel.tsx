import { BadgeCheck, MessageCircle, Phone, ShieldCheck } from "lucide-react";
import { InquiryForm } from "@/components/public/InquiryForm";
import type { ProjectWithRelations } from "@/types";

/**
 * The hero's right-hand column: the inquiry form, then the trust card under it.
 * This is the page's primary conversion point, which is why it sits at the top
 * beside the gallery rather than at the bottom of a long scroll.
 */
export function ProjectInquiryPanel({
  project,
  projectUrl,
  phoneDisplay,
  phoneTel,
  whatsapp,
}: {
  project: ProjectWithRelations;
  projectUrl: string;
  phoneDisplay: string;
  phoneTel: string;
  whatsapp: string;
}) {
  const waHref = `https://wa.me/${whatsapp}?text=${encodeURIComponent(
    `Hi, I'm interested in "${project.name}".`,
  )}`;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-bold text-(--color-brand) wrap-break-word">
          Interested in {project.name}?
        </h2>
        <p className="mb-5 mt-1 text-xs text-gray-400">
          Send us a message and we&apos;ll get back to you.
        </p>

        <InquiryForm
          projectId={project.id}
          projectUrl={projectUrl}
          title={project.name}
          phone={phoneTel}
        />

        <div className="mt-4 grid grid-cols-2 gap-3">
          <a
            href={`tel:${phoneTel}`}
            className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-semibold text-(--color-brand) transition-colors hover:bg-(--color-brand)/5"
          >
            <Phone size={15} /> Call
          </a>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-700"
          >
            <MessageCircle size={15} /> WhatsApp
          </a>
        </div>
      </div>

      <div className="space-y-3.5 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        {/* Only claims RERA registration when the admin has entered a number. */}
        {project.rera_number && (
          <TrustRow
            icon={ShieldCheck}
            text="RERA registered &amp; verified project"
            sub={project.rera_number}
          />
        )}
        <TrustRow icon={BadgeCheck} text="No brokerage, transparent pricing" />
        <TrustRow icon={Phone} text={`Talk to an expert: ${phoneDisplay}`} />
      </div>
    </div>
  );
}

function TrustRow({
  icon: Icon,
  text,
  sub,
}: {
  icon: typeof ShieldCheck;
  text: string;
  sub?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-(--color-brand)/5">
        <Icon size={16} className="text-(--color-brand)" />
      </span>
      <div className="min-w-0">
        <p className="text-[13px] text-gray-600 wrap-break-word">{text}</p>
        {sub && <p className="text-[11px] text-gray-400 wrap-break-word">{sub}</p>}
      </div>
    </div>
  );
}
