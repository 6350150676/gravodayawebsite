import { IndianRupee, Info } from "lucide-react";
import { SectionHeading } from "@/components/public/project/SectionHeading";
import { ProjectRichText } from "@/components/public/ProjectRichText";
import type { ProjectCharge, ProjectPaymentRow } from "@/types";

// Only render a column some row actually fills in. A plotted colony has no
// towers and a pre-launch has no prices; showing those headers over a column of
// dashes makes the project look like it's hiding something.
const COLUMNS = [
  { key: "unit_type", label: "Unit Type" },
  { key: "tower", label: "Tower / Block" },
  { key: "area", label: "Area" },
  { key: "price", label: "Base Price" },
  { key: "charges", label: "Additional Charges" },
  { key: "availability", label: "Status" },
] as const satisfies readonly { key: keyof ProjectPaymentRow; label: string }[];

// "Sold out" should not look like "Available". Everything else is neutral.
function statusTone(status: string): string {
  if (/sold|closed|unavailable/i.test(status)) return "bg-gray-100 text-gray-500";
  if (/few|limited|last|hurry/i.test(status)) return "bg-(--color-gold)/12 text-(--color-gold)";
  return "bg-green-50 text-green-700";
}

export function ProjectPaymentPlan({
  rows,
  charges,
  note,
  legacyText,
}: {
  rows: ProjectPaymentRow[];
  charges: ProjectCharge[];
  note?: string | null;
  /** The older free-text payment_plan field, still rendered beneath the table. */
  legacyText?: string | null;
}) {
  // Nothing to show at all — the section disappears rather than sitting empty.
  if (rows.length === 0 && charges.length === 0 && !legacyText?.trim()) return null;

  const columns = COLUMNS.filter((c) => rows.some((r) => r[c.key].trim() !== ""));

  return (
    <section className="scroll-mt-44" id="payment-plan">
      <SectionHeading
        eyebrow="Pricing"
        title="Payment Plan"
        lead="Indicative pricing by configuration. Talk to us for the current, unit-level quote."
        icon={IndianRupee}
      />

      {rows.length > 0 && (
        <div className="mt-8 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          {/* Desktop: a real table. */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead>
                <tr className="bg-(--color-brand) text-white">
                  {columns.map((c) => (
                    <th
                      key={c.key}
                      scope="col"
                      className="whitespace-nowrap px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider"
                    >
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr
                    key={`${row.unit_type}-${i}`}
                    className="border-t border-gray-100 transition-colors hover:bg-(--color-sand)/60"
                  >
                    {columns.map((c) => (
                      <td key={c.key} className="px-5 py-4 align-top text-sm text-gray-600">
                        {c.key === "unit_type" ? (
                          <span className="font-bold text-(--color-brand)">{row.unit_type}</span>
                        ) : c.key === "price" ? (
                          <span className="font-semibold text-(--color-brand)">{row.price || "—"}</span>
                        ) : c.key === "availability" ? (
                          row.availability ? (
                            <span
                              className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold ${statusTone(
                                row.availability,
                              )}`}
                            >
                              {row.availability}
                            </span>
                          ) : (
                            "—"
                          )
                        ) : (
                          row[c.key] || "—"
                        )}
                        {c.key === "unit_type" && row.notes && (
                          <span className="mt-1 block text-xs font-normal text-gray-400">
                            {row.notes}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: one card per configuration — a scrolling table is unusable
              at 360px, and these rows are label/value pairs anyway. */}
          <ul className="divide-y divide-gray-100 md:hidden">
            {rows.map((row, i) => (
              <li key={`${row.unit_type}-${i}`} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-base font-bold text-(--color-brand) wrap-break-word">
                      {row.unit_type}
                    </p>
                    {row.tower && <p className="mt-0.5 text-xs text-gray-400">{row.tower}</p>}
                  </div>
                  {row.availability && (
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${statusTone(
                        row.availability,
                      )}`}
                    >
                      {row.availability}
                    </span>
                  )}
                </div>

                <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5">
                  {row.area && <Cell label="Area" value={row.area} />}
                  {row.price && <Cell label="Base price" value={row.price} strong />}
                  {row.charges && <Cell label="Additional charges" value={row.charges} wide />}
                </dl>

                {row.notes && <p className="mt-3 text-xs leading-relaxed text-gray-400">{row.notes}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {charges.length > 0 && (
        <div className="mt-5 rounded-2xl border border-(--color-gold)/25 bg-(--color-gold)/[0.05] p-5 sm:p-6">
          <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-(--color-brand)">
            <Info size={15} className="text-(--color-gold)" /> Additional Charges
          </h3>
          <ul className="mt-4 grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
            {charges.map((c, i) => (
              <li
                key={`${c.label}-${i}`}
                className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-b border-(--color-gold)/15 pb-2.5 last:border-b-0"
              >
                <div className="min-w-0">
                  <span className="text-sm font-medium text-gray-700 wrap-break-word">{c.label}</span>
                  {c.note && <span className="mt-0.5 block text-xs text-gray-400">{c.note}</span>}
                </div>
                {c.value && (
                  <span className="shrink-0 text-sm font-bold text-(--color-brand)">{c.value}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {legacyText?.trim() && (
        <div className="mt-5 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
          <ProjectRichText text={legacyText} />
        </div>
      )}

      {note?.trim() && (
        <p className="mt-4 text-xs leading-relaxed text-gray-400">{note}</p>
      )}
    </section>
  );
}

function Cell({
  label,
  value,
  strong,
  wide,
}: {
  label: string;
  value: string;
  strong?: boolean;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "col-span-2" : ""}>
      <dt className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</dt>
      <dd
        className={`mt-0.5 text-sm wrap-break-word ${
          strong ? "font-bold text-(--color-brand)" : "text-gray-600"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
