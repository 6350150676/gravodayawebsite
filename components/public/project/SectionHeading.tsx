import type { LucideIcon } from "lucide-react";

/**
 * The one heading treatment every section on the project page uses: a small
 * terracotta eyebrow over a forest-green title, with an optional lead line.
 * Keeping it in one place is what makes the page read as a single document
 * rather than a stack of unrelated cards.
 */
export function SectionHeading({
  eyebrow,
  title,
  lead,
  icon: Icon,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  icon?: LucideIcon;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "text-center max-w-2xl mx-auto" : "max-w-3xl"}>
      <p
        className={`flex items-center gap-1.5 text-[11px] sm:text-xs font-bold tracking-[0.2em] uppercase text-(--color-gold) ${
          align === "center" ? "justify-center" : ""
        }`}
      >
        {Icon && <Icon size={13} />}
        {eyebrow}
      </p>
      <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-(--color-brand) leading-tight wrap-break-word">
        {title}
      </h2>
      {lead && <p className="mt-3 text-[15px] text-gray-500 leading-relaxed">{lead}</p>}
      <span
        className={`mt-4 block h-px w-16 bg-gradient-to-r from-(--color-gold) to-transparent ${
          align === "center" ? "mx-auto bg-gradient-to-r from-transparent via-(--color-gold) to-transparent w-24" : ""
        }`}
      />
    </div>
  );
}
