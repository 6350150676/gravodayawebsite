import type {
  ProjectAmenityGroup,
  ProjectCharge,
  ProjectHighlight,
  ProjectLocationAdvantage,
  ProjectPaymentRow,
} from "@/types";

/**
 * Reads the structured sections of a project out of the two free-text fields
 * projects were written in before those sections existed: one long
 * `description` ("PROJECT HIGHLIGHTS", a bullet list, "LOCATION ADVANTAGE", …)
 * and one `payment_plan` blob.
 *
 * Two callers, one set of rules:
 *
 *   • the detail page, for any project whose structured fields are still empty
 *     — it renders the full design instead of a wall of text, with no admin
 *     work and without waiting for a database migration;
 *   • scripts/backfill-project-content.mjs, which writes the same result into
 *     the structured columns once, so the admin can then edit it in the panel.
 *
 * Nothing in here knows about a particular project. It recognises the
 * conventions the text already follows — ALL-CAPS headings, "-" bullets,
 * "place — time" pairs, "**1 BHK — A Tower**" — and anything it doesn't
 * understand is handed back untouched in `description` / kept in the payment
 * blob, so no content can be lost by guessing wrong.
 */

// A dash typed straight against the word is still a bullet — admins type both
// "- Reading Room" and "-Reading Room", and the second is not a sentence.
const BULLET = /^[-*•]\s*/;

const plain = (s: string) => s.replace(/\*\*/g, "").trim();
const stripLead = (s: string) => s.replace(/^[-–—•*\s]+/, "").trim();
/** Drops the punctuation left dangling when a sentence is cut in two. */
const tidy = (s: string) => s.trim().replace(/[,;:–—-]+$/, "").trim();

const titleCase = (s: string) =>
  s.toLowerCase().replace(/(^|[\s&/(-])([a-z])/g, (_, p: string, c: string) => p + c.toUpperCase());

const median = (nums: number[]) =>
  nums.length ? [...nums].sort((a, b) => a - b)[Math.floor(nums.length / 2)] : 0;

/** An ALL-CAPS line is a section heading — the convention every description uses. */
function isHeading(line: string): boolean {
  const bare = stripLead(plain(line));
  if (!bare) return false;
  const letters = bare.replace(/[^A-Za-z]/g, "");
  return letters.length >= 4 && letters === letters.toUpperCase() && bare.length <= 80;
}

interface Section {
  heading: string;
  lines: string[];
}

/** Splits a description into its lead paragraph and its ALL-CAPS sections. */
function splitSections(text: string): { lead: string; sections: Section[] } {
  const lead: string[] = [];
  const sections: Section[] = [];
  let current: Section | null = null;

  for (const raw of text.split("\n")) {
    if (isHeading(raw)) {
      current = { heading: stripLead(plain(raw)), lines: [] };
      sections.push(current);
    } else if (current) {
      current.lines.push(raw);
    } else {
      lead.push(raw);
    }
  }

  return { lead: plain(lead.join("\n")).trim(), sections };
}

/**
 * "Prime location in Haridwar, just 2 minutes away" → title + description.
 *
 * Only splits where the writer put a real break — a dash, a colon, or a comma
 * with a full phrase in front of it. A bullet with no such break becomes a
 * title on its own rather than being cut mid-sentence; the admin can shorten
 * it in the panel, which beats guessing wrong here.
 */
function toHighlight(text: string): ProjectHighlight {
  const strong = /^(.{4,60}?)\s*(?:—|–|:)\s+(.+)$/.exec(text);
  const comma = /^(.{4,60}?),\s+(.+)$/.exec(text);
  const split = strong ?? (comma && comma[1].split(/\s+/).length >= 4 ? comma : null);

  if (split && split[1].split(/\s+/).length <= 8) {
    return { icon: "", title: tidy(split[1]), description: tidy(split[2]) };
  }
  return { icon: "", title: tidy(text), description: "" };
}

/** "Har Ki Pauri — 2 Minutes" → place + distance. */
function toLocation(text: string): ProjectLocationAdvantage {
  const split = /^(.+?)\s*(?:—|–|·|:|\s-\s)\s*(.+)$/.exec(text);
  return split
    ? { icon: "", place: tidy(split[1]), distance: split[2].trim() }
    : { icon: "", place: tidy(text), distance: "" };
}

export interface LegacyDescription {
  /** The opening paragraph, when it is short enough to read as an intro. */
  overview: string;
  highlights: ProjectHighlight[];
  amenityGroups: ProjectAmenityGroup[];
  locations: ProjectLocationAdvantage[];
  /** Everything that wasn't lifted out, still in its original form. */
  description: string;
}

export function parseLegacyDescription(description: string): LegacyDescription {
  const { lead, sections } = splitSections(description ?? "");
  const highlights: ProjectHighlight[] = [];
  const amenityGroups: ProjectAmenityGroup[] = [];
  const locations: ProjectLocationAdvantage[] = [];
  const kept: string[] = [];

  for (const section of sections) {
    const bullets = section.lines
      .filter((l) => BULLET.test(l.trim()))
      .map((l) => plain(l.trim()).replace(BULLET, "").trim());
    const strays = section.lines
      .filter((l) => l.trim() && !BULLET.test(l.trim()))
      .map((l) => plain(l));
    const keep = () => kept.push(`${section.heading}\n${section.lines.join("\n").trim()}`);

    if (bullets.length === 0) {
      keep();
      continue;
    }

    if (/HIGHLIGHT|KEY FEATURE|USP/i.test(section.heading)) {
      highlights.push(...bullets.map(toHighlight));
      continue;
    }

    if (/LOCATION|CONNECTIVIT|NEARBY|DISTANCE|NEIGHBOURHOOD|NEIGHBORHOOD/i.test(section.heading)) {
      locations.push(...bullets.map(toLocation));
      continue;
    }

    // A list of short phrases is a feature list; anything wordier is prose that
    // happens to be bulleted (a unit mix, a specification) and stays put.
    //
    // The first item of a list is often typed without its dash by accident, so
    // a short stray line inside an otherwise bulleted list counts as an item —
    // but a real sentence in there means the section is prose, and it stays.
    const straysAreItems = strays.every((l) => l.length < 70 && !/[.!?]$/.test(l));
    const items = straysAreItems
      ? section.lines.map((l) => plain(l.trim()).replace(BULLET, "").trim()).filter(Boolean)
      : bullets;

    if (straysAreItems && bullets.length >= 3 && median(items.map((i) => i.length)) < 70) {
      amenityGroups.push({ icon: "", title: titleCase(section.heading), items });
      continue;
    }

    keep();
  }

  // With no headings to split on, `lead` is the entire description — which is a
  // description, not a two-line overview. Take its opening paragraph, and only
  // if that is short enough to read as one.
  const opening = lead.split(/\n\s*\n/)[0].trim();

  return {
    overview: opening.length <= 400 ? opening : "",
    highlights,
    amenityGroups,
    locations,
    description: kept.join("\n\n").trim(),
  };
}

const CHARGE_HEADING = /PLC|CHARGE|GST|TAX|EXTRA|FEE|IFMS|MAINTENANCE|STAMP|REGISTR/i;
const PLAN_TITLE = /^(PRICE|PAYMENT|PRICE & PAYMENT|PRICE AND PAYMENT)[\s&A-Z]*PLAN$/i;
const UNIT_LIKE = /\bbhk\b|\bplot\b|villa|studio|penthouse|duplex|\bshop\b|office|\bunit\b|tower|block|\btype\b/i;
const MONEY = /₹|\brs\.?\s*\d|lakh|crore|\bcr\b|\bl\b\s*[-–—]/i;
const AREA = /\bsq\.?\s?(?:ft|m|yd|yds|feet)|\bsqft\b|\byard|\bacre|\bmarla|\bbigha/i;
const TOWER = /tower|block|wing|phase|building/i;

export interface LegacyPaymentPlan {
  rows: ProjectPaymentRow[];
  charges: ProjectCharge[];
  note: string;
  /** Lines the parser couldn't place. Above zero, keep the original text. */
  unrecognised: number;
}

/**
 * Reads a free-text payment plan into priced rows, the charges that sit on top
 * of them, and the fine print.
 *
 * Each line is classified by what it says rather than by whether it starts with
 * a dash — admins type "- 1 BHK — A Tower", "-1 BHK — A Tower" and
 * "1 BHK — A Tower" interchangeably, and the marker tells you nothing about
 * which of those is a heading and which is a price under it.
 */
export function parseLegacyPaymentPlan(text: string): LegacyPaymentPlan {
  const rows: ProjectPaymentRow[] = [];
  const charges: ProjectCharge[] = [];
  const notes: string[] = [];
  let mode: "units" | "charges" | null = null;
  let unit: { unit_type: string; tower: string } | null = null;
  let unrecognised = 0;

  /** "…— ₹80 Lakhs (Sold Out)" → the status, and the line without it. */
  const takeStatus = (line: string) => {
    const status = /\(([^)]{2,30})\)\s*$/.exec(line);
    return status
      ? { availability: status[1].trim(), rest: line.slice(0, status.index).trim() }
      : { availability: "", rest: line };
  };

  for (const raw of (text ?? "").split("\n")) {
    const item = plain(raw).replace(BULLET, "").trim();
    if (!item) continue;

    // The block's own title — "PRICE & PAYMENT PLAN".
    if (PLAN_TITLE.test(item)) {
      mode = null;
      unit = null;
      continue;
    }

    // "Note: …", and any loose sentence, is fine print.
    if (/^note\b/i.test(item) || item.split(/\s+/).length > 12) {
      notes.push(item);
      continue;
    }

    // A charge, or the heading that introduces a group of them. Either way it
    // may carry its own value: "PLC: applicable from the 1st floor".
    if (CHARGE_HEADING.test(item)) {
      mode = "charges";
      unit = null;
      const pair = /^(.{2,60}?)\s*:\s*(.+)$/.exec(item);
      charges.push(
        pair
          ? { label: pair[1].trim(), value: pair[2].trim(), note: "" }
          : { label: item.replace(/:$/, ""), value: "", note: "" },
      );
      continue;
    }

    if (UNIT_LIKE.test(item)) {
      const { availability, rest } = takeStatus(item);
      const segments = rest.split(/\s*(?:—|–|\||;|\s-\s)\s*/).map((p) => p.trim()).filter(Boolean);
      const area = segments.slice(1).find((p) => AREA.test(p)) ?? "";
      const price = segments.slice(1).find((p) => MONEY.test(p) && p !== area) ?? "";

      // "2 BHK — 1200 Sq. Ft. — ₹1.20 Crore" is a whole row on one line;
      // "1 BHK — A Tower" is the heading for the sizes listed under it.
      if (area || price) {
        rows.push({
          unit_type: segments[0] ?? rest,
          tower: segments.slice(1).find((p) => TOWER.test(p) && p !== area && p !== price) ?? unit?.tower ?? "",
          area,
          price,
          availability,
          charges: "",
          notes: "",
        });
        mode = "units";
        continue;
      }

      mode = "units";
      unit = { unit_type: segments[0] ?? rest, tower: segments.slice(1).join(" — ") };
      continue;
    }

    if (mode === "charges") {
      // "3rd, 4th & 5th Floor: ₹150 / Sq. Ft."
      const pair = /^(.{2,60}?)\s*:\s*(.+)$/.exec(item);
      charges.push(
        pair
          ? { label: pair[1].trim(), value: pair[2].trim(), note: "" }
          : { label: item, value: "", note: "" },
      );
      continue;
    }

    if (mode === "units" && unit) {
      // "800 Sq. Ft. — ₹80 Lakhs (Sold Out)"
      const { availability, rest } = takeStatus(item);
      const parts = /^(.+?)\s*(?:—|–|\||\s-\s|:)\s*(.+)$/.exec(rest);
      rows.push({
        unit_type: unit.unit_type,
        tower: unit.tower,
        area: parts ? parts[1].trim() : rest,
        price: parts ? parts[2].trim() : "",
        availability,
        charges: "",
        notes: "",
      });
      continue;
    }

    unrecognised++;
    notes.push(item);
  }

  return { rows, charges, note: notes.join("\n"), unrecognised };
}

export interface LegacyProjectContent {
  overview: string;
  highlights: ProjectHighlight[];
  amenityGroups: ProjectAmenityGroup[];
  locationAdvantages: ProjectLocationAdvantage[];
  paymentRows: ProjectPaymentRow[];
  additionalCharges: ProjectCharge[];
  paymentNote: string;
  /** The description with everything that moved into a section taken out. */
  description: string;
  /**
   * The original payment text, when the parser couldn't account for all of it.
   * Rendered as-is underneath, so nothing an admin typed disappears.
   */
  paymentPlanText: string;
}

/** Everything the structured sections need, read out of the free-text fields. */
export function deriveLegacyContent(project: {
  description: string;
  payment_plan?: string | null;
}): LegacyProjectContent {
  const desc = parseLegacyDescription(project.description ?? "");
  const pay = parseLegacyPaymentPlan(project.payment_plan ?? "");

  // All or nothing on the plan. A half-read plan would show the rows it did
  // understand *and* the original text underneath them — the same prices
  // twice, in two different shapes. Unless every line was placed, the text is
  // left exactly as the admin wrote it and rendered as before.
  const parsedThePlan = (pay.rows.length > 0 || pay.charges.length > 0) && pay.unrecognised === 0;

  return {
    overview: desc.overview,
    highlights: desc.highlights,
    amenityGroups: desc.amenityGroups,
    locationAdvantages: desc.locations,
    paymentRows: parsedThePlan ? pay.rows : [],
    additionalCharges: parsedThePlan ? pay.charges : [],
    paymentNote: parsedThePlan ? pay.note : "",
    description: desc.description,
    paymentPlanText: parsedThePlan ? "" : (project.payment_plan ?? ""),
  };
}
