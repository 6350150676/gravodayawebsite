import { ClipboardList, Info, Phone } from "lucide-react";
import { ProjectRichText } from "@/components/public/ProjectRichText";
import { groupPaymentRows, parseNoteCells } from "@/lib/project-content";
import { projectIcon } from "@/lib/project-icons";
import type { ProjectCharge, ProjectPaymentRow } from "@/types";

/**
 * The price & payment plan, as a section of its own: configurations down the
 * left, the charges that sit on top of those prices down the right, the fine
 * print under both and a call bar to close it.
 *
 * Nothing about the shape is fixed. Rows are grouped rather than tabulated
 * because projects don't share columns — a plotted colony has no towers, a
 * pre-launch has no prices — so every field the admin left blank simply doesn't
 * appear, and each of the four blocks disappears entirely when its data is
 * empty. A project with two prices and nothing else renders as one narrow card.
 */
export function ProjectPaymentPlan({
  rows,
  charges,
  note,
  legacyText,
  phoneDisplay,
  phoneTel,
}: {
  rows: ProjectPaymentRow[];
  charges: ProjectCharge[];
  note?: string | null;
  /** The older free-text payment_plan field, still rendered when present. */
  legacyText?: string | null;
  phoneDisplay?: string;
  phoneTel?: string;
}) {
  const groups = groupPaymentRows(rows);
  const noteCells = parseNoteCells(note);
  const hasLegacy = !!legacyText?.trim();

  if (groups.length === 0 && charges.length === 0 && noteCells.length === 0 && !hasLegacy) {
    return null;
  }

  return (
    <section id="payment-plan" className="scroll-mt-32">
      <SectionTitle title="Payment Plan" kicker={"Price & Payment Plan"} />

      <div
        className={`grid grid-cols-1 gap-5 ${
          charges.length > 0 ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)]" : ""
        }`}
      >
        {(groups.length > 0 || hasLegacy) && (
          <div className="min-w-0 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
            {groups.length > 0 && (
              <ul className="divide-y divide-gray-100">
                {groups.map((group, i) => {
                  // Payment rows carry no stored icon — projectIcon reads the
                  // unit type instead ("3 BHK" → bed, "Plot" → ruler).
                  const Icon = projectIcon("", `${group.unit_type} ${group.tower}`);
                  return (
                    <li
                      key={`${group.unit_type}-${group.tower}-${i}`}
                      className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:gap-5 sm:py-5"
                    >
                      <div className="flex min-w-0 items-center gap-3 sm:w-[44%]">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-(--color-brand)">
                          <Icon size={18} strokeWidth={1.6} className="text-(--color-gold)" />
                        </span>
                        <p className="min-w-0 text-base font-bold leading-tight text-(--color-brand) wrap-break-word sm:text-lg">
                          {group.unit_type}
                          {group.tower && (
                            <span className="font-semibold text-gray-500"> — {group.tower}</span>
                          )}
                        </p>
                      </div>

                      <ul className="min-w-0 flex-1 space-y-2 sm:border-l sm:border-gray-100 sm:pl-5">
                        {group.lines.map((line, j) => (
                          <li key={j} className="min-w-0">
                            <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[13px] leading-relaxed text-gray-600 sm:text-sm">
                              <span
                                aria-hidden
                                className="mt-1.5 h-1.5 w-1.5 shrink-0 self-start rounded-full bg-(--color-gold)"
                              />
                              <span className="min-w-0 wrap-break-word">
                                {[line.area, line.price].filter(Boolean).join(" — ") || line.charges}
                                {line.area && line.price && line.charges && (
                                  <span className="text-gray-400"> {line.charges}</span>
                                )}
                              </span>
                              {line.availability && (
                                <span
                                  className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-bold ${statusTone(
                                    line.availability,
                                  )}`}
                                >
                                  {line.availability}
                                </span>
                              )}
                            </p>
                            {line.notes && (
                              <p className="mt-0.5 pl-3.5 text-xs text-gray-400 wrap-break-word">
                                {line.notes}
                              </p>
                            )}
                          </li>
                        ))}
                      </ul>
                    </li>
                  );
                })}
              </ul>
            )}

            {/* Projects written before the payment table existed keep their
                free-text plan, rendered under whatever rows do exist. */}
            {hasLegacy && (
              <div className={groups.length > 0 ? "mt-6 border-t border-gray-100 pt-5" : ""}>
                <ProjectRichText text={legacyText!} />
              </div>
            )}
          </div>
        )}

        {charges.length > 0 && (
          <aside className="min-w-0 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <h3 className="flex items-center gap-2 bg-(--color-brand) px-5 py-3.5 text-[11px] font-bold uppercase tracking-[0.16em] text-white">
              <Info size={14} className="shrink-0 text-(--color-gold)" />
              Additional Charges
            </h3>
            <ul className="divide-y divide-gray-100">
              {charges.map((charge, i) => {
                const Icon = projectIcon("", `${charge.label} ${charge.note}`);
                return (
                  <li key={`${charge.label}-${i}`} className="flex items-start gap-3 px-5 py-3.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-(--color-sand)">
                      <Icon size={15} strokeWidth={1.7} className="text-(--color-brand)" />
                    </span>
                    {/* The amount sits beside a short label and drops under a
                        long one — squeezing both onto one line is what breaks
                        "Balance on plot registry" across a word. */}
                    <div className="flex min-w-0 flex-1 flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold leading-snug text-(--color-brand)">
                          {charge.label}
                        </p>
                        {charge.note && (
                          <p className="mt-0.5 text-[11px] leading-snug text-gray-400">{charge.note}</p>
                        )}
                      </div>
                      {charge.value && (
                        <span className="text-[13px] font-bold text-(--color-gold)">{charge.value}</span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </aside>
        )}
      </div>

      {noteCells.length > 0 && (
        <div
          className={`mt-5 grid grid-cols-1 gap-x-8 gap-y-5 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm ${
            noteCells.length > 1 ? "sm:grid-cols-2" : ""
          }`}
        >
          {noteCells.map((cell, i) => (
            <div key={i} className="flex min-w-0 items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-(--color-brand)/5">
                <ClipboardList size={15} className="text-(--color-brand)" />
              </span>
              <div className="min-w-0">
                {cell.heading && (
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-(--color-brand) wrap-break-word">
                    {cell.heading}
                  </p>
                )}
                <p className="mt-1 text-[13px] leading-relaxed text-gray-500 wrap-break-word">
                  {cell.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {phoneTel && (
        <a
          href={`tel:${phoneTel}`}
          className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-2xl bg-(--color-brand) px-5 py-4 text-center text-sm font-semibold text-white transition-colors hover:bg-(--color-brand-light)"
        >
          <Phone size={16} className="shrink-0 text-(--color-gold)" />
          For more details, contact our sales team
          {phoneDisplay && <span className="font-bold text-(--color-gold)">{phoneDisplay}</span>}
        </a>
      )}
    </section>
  );
}

/**
 * The section's masthead — a centred title between two hairlines, with the
 * kicker under it. Used only here; the blocks inside the main content card use
 * the quieter <SubHeading /> instead.
 */
function SectionTitle({ title, kicker }: { title: string; kicker: string }) {
  return (
    <header className="mb-6 text-center">
      <div className="flex items-center justify-center gap-4">
        <Rule className="rotate-180" />
        <h2 className="text-xl font-bold uppercase tracking-[0.1em] text-(--color-brand) sm:text-2xl">
          {title}
        </h2>
        <Rule />
      </div>
      <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-(--color-gold)">
        {kicker}
      </p>
    </header>
  );
}

function Rule({ className = "" }: { className?: string }) {
  return (
    <span aria-hidden className={`hidden items-center gap-2 sm:flex ${className}`}>
      <span className="h-px w-10 bg-gradient-to-r from-transparent to-(--color-gold)/45 md:w-20" />
      <span className="h-1.5 w-1.5 rotate-45 bg-(--color-gold)/60" />
    </span>
  );
}

// "Sold out" must not look like "Available"; everything else stays neutral.
function statusTone(status: string): string {
  if (/sold|closed|unavailable/i.test(status)) return "bg-gray-100 text-gray-500";
  if (/few|limited|last|hurry/i.test(status)) return "bg-(--color-gold)/15 text-(--color-gold)";
  return "bg-green-50 text-green-700";
}
