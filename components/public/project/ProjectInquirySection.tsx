import { Clock, Mail, MessageCircle, Phone } from "lucide-react";
import { InquiryForm } from "@/components/public/InquiryForm";
import { SectionHeading } from "@/components/public/project/SectionHeading";

/**
 * The one full inquiry form on the page, laid out across the full width: the
 * reasons to get in touch on the left, the form on the right. A ~460px form
 * centred in a 1200px section would leave most of the row empty.
 */
export function ProjectInquirySection({
  projectId,
  projectUrl,
  projectName,
  phoneDisplay,
  phoneTel,
  whatsapp,
}: {
  projectId: string;
  projectUrl: string;
  projectName: string;
  phoneDisplay: string;
  phoneTel: string;
  whatsapp: string;
}) {
  const waHref = `https://wa.me/${whatsapp}?text=${encodeURIComponent(
    `Hi, I'd like details about "${projectName}".`,
  )}`;

  return (
    <section className="scroll-mt-44" id="enquire">
      <SectionHeading eyebrow="Get in touch" title="Request Details & Pricing" icon={Mail} />

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-10">
        <div className="flex flex-col justify-center">
          <p className="text-[15px] leading-relaxed text-gray-600">
            Send us a message about {projectName} and our team will come back to you with floor
            plans, current availability and an exact, unit-level price — usually the same day.
          </p>

          <ul className="mt-6 space-y-3">
            <Point icon={Clock} title="Same-day response" text="Weekdays, during business hours." />
            <Point icon={Mail} title="Full details" text="Floor plans, payment schedule and the current price list." />
            <Point icon={Phone} title="No obligation" text="No brokerage, and we never share your number." />
          </ul>

          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href={`tel:${phoneTel}`}
              className="inline-flex items-center gap-2 rounded-xl border border-(--color-royal)/40 px-5 py-3 text-sm font-semibold text-(--color-royal) transition-colors hover:bg-(--color-royal)/5"
            >
              <Phone size={15} /> {phoneDisplay}
            </a>
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-700"
            >
              <MessageCircle size={15} /> WhatsApp
            </a>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-7">
          <InquiryForm
            projectId={projectId}
            projectUrl={projectUrl}
            title={projectName}
            phone={phoneTel}
          />
        </div>
      </div>
    </section>
  );
}

function Point({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof Clock;
  title: string;
  text: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-(--color-gold)/10">
        <Icon size={15} className="text-(--color-gold)" />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-bold text-(--color-brand)">{title}</p>
        <p className="text-sm text-gray-500 wrap-break-word">{text}</p>
      </div>
    </li>
  );
}
