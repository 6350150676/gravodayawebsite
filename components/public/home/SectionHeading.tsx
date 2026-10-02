import Link from "next/link";
import { ArrowRight } from "lucide-react";

type Tone = "light" | "dark";

/** "01 ── FEATURED PROJECTS" — the numbered rule-and-label above a heading. */
export function Eyebrow({
  index,
  tone = "light",
  children,
}: {
  index?: string;
  tone?: Tone;
  children: React.ReactNode;
}) {
  return (
    <p
      className={`flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.3em] ${
        tone === "dark" ? "text-(--color-terracotta-light)" : "text-(--color-terracotta)"
      }`}
    >
      {index && <span className="font-display text-sm font-semibold tracking-normal">{index}</span>}
      <span className="h-px w-10 bg-current opacity-60" />
      {children}
    </p>
  );
}

/**
 * Homepage section header: eyebrow, serif title (wrap the accent words in <em>
 * for the italic terracotta treatment), optional intro and a quiet text link.
 */
export function SectionHeading({
  index,
  eyebrow,
  title,
  intro,
  action,
  tone = "light",
}: {
  index?: string;
  eyebrow: string;
  title: React.ReactNode;
  intro?: string;
  action?: { href: string; label: string };
  tone?: Tone;
}) {
  const dark = tone === "dark";
  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-2xl">
        <Eyebrow index={index} tone={tone}>{eyebrow}</Eyebrow>
        <h2
          className={`mt-5 font-display font-medium text-[2.6rem] leading-[1.05] sm:text-5xl lg:text-6xl tracking-[-0.01em] text-balance [&_em]:font-normal ${
            dark
              ? "text-white [&_em]:text-(--color-terracotta-light)"
              : "text-(--color-forest) [&_em]:text-(--color-terracotta)"
          }`}
        >
          {title}
        </h2>
        {intro && (
          <p className={`mt-5 max-w-xl text-[15px] leading-relaxed ${dark ? "text-white/65" : "text-(--color-charcoal)/70"}`}>
            {intro}
          </p>
        )}
      </div>
      {action && (
        <Link
          href={action.href}
          className={`link-line self-start lg:self-auto shrink-0 text-xs font-semibold uppercase tracking-[0.22em] ${
            dark ? "text-white" : "text-(--color-forest)"
          }`}
        >
          {action.label} <ArrowRight size={14} />
        </Link>
      )}
    </div>
  );
}
