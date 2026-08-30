import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Bed,
  Waves,
  Dumbbell,
  ChefHat,
  ShowerHead,
  Car,
  Trees,
  Clapperboard,
  Sparkles,
  Gamepad2,
  Baby,
  Shield,
  ArrowUpDown,
  PartyPopper,
  Zap,
  DoorOpen,
  Shirt,
  Sofa,
  Flower2,
  Footprints,
  Building2,
  Users,
  CheckCircle2,
} from "lucide-react";

const ICON_RULES: [RegExp, LucideIcon][] = [
  [/bedroom|bed\b/i, Bed],
  [/kids|play area|play zone/i, Baby],
  [/pool|swim/i, Waves],
  [/\bgym\b/i, Dumbbell],
  [/kitchen/i, ChefHat],
  [/toilet|bath|shower/i, ShowerHead],
  [/parking|fastag|ev fast-charging/i, Car],
  [/garden|lawn|landscape|plantation|park\b/i, Trees],
  [/theatre|theater|cinema/i, Clapperboard],
  [/jacuzzi|spa|sauna/i, Sparkles],
  [/indoor games|tt room|table tennis/i, Gamepad2],
  [/security|fire-retardant|seismic/i, Shield],
  [/lift|staircase/i, ArrowUpDown],
  [/party hall/i, PartyPopper],
  [/electric|wiring|power/i, Zap],
  [/door|window/i, DoorOpen],
  [/wardrobe|dresser|shoe rack/i, Shirt],
  [/living|drawing|dining|lounge|pantry/i, Sofa],
  [/fragrance|plumeria|floral/i, Flower2],
  [/jogging|reflexology|walkway|path/i, Footprints],
  [/clubhouse|club house|facade/i, Building2],
  [/connectivity|railway|airport|bus stand/i, Users],
];

function iconFor(line: string): LucideIcon {
  for (const [pattern, Icon] of ICON_RULES) {
    if (pattern.test(line)) return Icon;
  }
  return CheckCircle2;
}

function isSectionHeading(line: string): boolean {
  const letters = line.replace(/[^A-Za-z]/g, "");
  return letters.length >= 4 && letters === letters.toUpperCase();
}

// Admins write these descriptions in the same Markdown they use everywhere
// else — **bold**, and "*" or "•" for bullets as often as "-". Only "-" was
// understood, so real listings rendered raw asterisks: "**1 BHK — A Tower**".
const BULLET = /^[-*•]\s+/;
const FULLY_BOLD = /^\*\*(.+)\*\*$/;

/** Strips the bold markers, for heading detection. */
function plain(line: string): string {
  return line.replace(/\*\*/g, "");
}

/**
 * Renders **bold** spans inline, leaving the rest as text. Any leftover "**"
 * is dropped rather than printed: a bold run that opens on one line and closes
 * on the next can't pair up here, and showing the raw markers is worse than
 * losing the emphasis.
 */
function inline(text: string): ReactNode[] {
  return text
    .split(/(\*\*[^*]+\*\*)/g)
    .filter(Boolean)
    .map((part, i) =>
      part.length > 4 && part.startsWith("**") && part.endsWith("**") ? (
        <strong key={i} className="font-semibold text-[var(--color-brand)]">
          {part.slice(2, -2)}
        </strong>
      ) : (
        part.replace(/\*\*/g, "")
      ),
    )
    .filter((part) => part !== "");
}

export function ProjectRichText({ text }: { text: string }) {
  const lines = text.split("\n");
  const blocks: ReactNode[] = [];
  let bulletBuffer: string[] = [];

  function flushBullets(key: string) {
    if (bulletBuffer.length === 0) return;
    // Two columns are right for a long feature list, but they strand a short
    // group in the left half with a hole beside it — which is exactly what a
    // payment plan looks like, where each tower heading has one or two sizes
    // under it. Short groups run as a single column instead.
    const columns = bulletBuffer.length > 3 ? "sm:grid-cols-2" : "";
    blocks.push(
      <ul key={key} className={`mt-3 mb-5 grid grid-cols-1 gap-x-6 gap-y-3 ${columns}`}>
        {bulletBuffer.map((item, i) => {
          const Icon = iconFor(plain(item));
          return (
            <li key={i} className="flex items-start gap-2.5 text-[15px] text-gray-600 leading-relaxed">
              <span className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-[var(--color-gold)]/15 flex items-center justify-center">
                <Icon size={13} className="text-[var(--color-brand)]" />
              </span>
              <span>{inline(item)}</span>
            </li>
          );
        })}
      </ul>
    );
    bulletBuffer = [];
  }

  lines.forEach((rawLine, idx) => {
    const line = rawLine.trim();

    if (BULLET.test(line)) {
      bulletBuffer.push(line.replace(BULLET, "").trim());
      return;
    }
    flushBullets(`bullets-${idx}`);

    if (!line) return;

    const bare = plain(line).trim();
    if (!bare) return;

    if (isSectionHeading(bare)) {
      blocks.push(
        <h3
          key={idx}
          className="mt-6 mb-1 first:mt-0 text-[13px] font-bold tracking-[0.14em] uppercase text-[var(--color-gold)] border-b border-[var(--color-gold)]/20 pb-2"
        >
          {bare}
        </h3>
      );
      return;
    }

    // A line that is nothing but one bold span is a sub-heading — that is how
    // "**1 BHK — A Tower**" is meant to read above the sizes under it.
    if (FULLY_BOLD.test(line) || (bare.endsWith(":") && bare.length < 80)) {
      blocks.push(
        <p key={idx} className="mt-5 mb-1 font-bold text-[var(--color-brand)] text-[15px]">
          {bare}
        </p>
      );
      return;
    }

    blocks.push(
      <p key={idx} className="text-gray-600 text-[15px] leading-relaxed mb-2">
        {inline(line)}
      </p>
    );
  });

  flushBullets("bullets-end");

  return <div>{blocks}</div>;
}
