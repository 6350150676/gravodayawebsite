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

export function ProjectRichText({ text }: { text: string }) {
  const lines = text.split("\n");
  const blocks: ReactNode[] = [];
  let bulletBuffer: string[] = [];

  function flushBullets(key: string) {
    if (bulletBuffer.length === 0) return;
    blocks.push(
      <ul key={key} className="mt-3 mb-5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
        {bulletBuffer.map((item, i) => {
          const Icon = iconFor(item);
          return (
            <li key={i} className="flex items-start gap-2.5 text-[15px] text-gray-600 leading-relaxed">
              <span className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-[var(--color-gold)]/15 flex items-center justify-center">
                <Icon size={13} className="text-[var(--color-brand)]" />
              </span>
              <span>{item}</span>
            </li>
          );
        })}
      </ul>
    );
    bulletBuffer = [];
  }

  lines.forEach((rawLine, idx) => {
    const line = rawLine.trim();

    if (line.startsWith("- ")) {
      bulletBuffer.push(line.slice(2).trim());
      return;
    }
    flushBullets(`bullets-${idx}`);

    if (!line) return;

    if (isSectionHeading(line)) {
      blocks.push(
        <h3
          key={idx}
          className="mt-6 mb-1 first:mt-0 text-[13px] font-bold tracking-[0.14em] uppercase text-[var(--color-gold)] border-b border-[var(--color-gold)]/20 pb-2"
        >
          {line}
        </h3>
      );
      return;
    }

    if (line.endsWith(":") && line.length < 80) {
      blocks.push(
        <p key={idx} className="mt-4 mb-1 font-semibold text-[var(--color-brand)] text-[15px]">
          {line}
        </p>
      );
      return;
    }

    blocks.push(
      <p key={idx} className="text-gray-600 text-[15px] leading-relaxed mb-2">
        {line}
      </p>
    );
  });

  flushBullets("bullets-end");

  return <div>{blocks}</div>;
}
