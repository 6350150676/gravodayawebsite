import type {
  ProjectAmenityGroup,
  ProjectCharge,
  ProjectHighlight,
  ProjectLocationAdvantage,
  ProjectPaymentRow,
  ProjectSpec,
} from "@/types";

// The structured sections live in jsonb columns, so what comes back from the
// database is `unknown` — and on a database that hasn't had the content
// migration applied yet, it's `undefined`. Everything here coerces rather than
// throws: a malformed row costs you that row, never the whole page.
//
// The same parsers run in the admin editor, so what the admin sees while
// editing is exactly what the public page will make of the saved value.

function str(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
}

function rows(value: unknown): Record<string, unknown>[] {
  // jsonb normally arrives parsed; a string is either a legacy value or the
  // hidden form input the admin editor submits.
  let raw = value;
  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(raw)) return [];
  return raw.filter((r): r is Record<string, unknown> => !!r && typeof r === "object" && !Array.isArray(r));
}

function stringList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(str).filter(Boolean);
  // A textarea in the editor gives us one item per line.
  if (typeof value === "string") return value.split("\n").map((s) => s.trim()).filter(Boolean);
  return [];
}

export function parseHighlights(value: unknown): ProjectHighlight[] {
  return rows(value)
    .map((r) => ({
      icon: str(r.icon),
      title: str(r.title),
      description: str(r.description),
    }))
    // A highlight with no title has nothing to render around.
    .filter((h) => h.title !== "");
}

export function parseAmenityGroups(value: unknown): ProjectAmenityGroup[] {
  return rows(value)
    .map((r) => ({
      icon: str(r.icon),
      title: str(r.title),
      items: stringList(r.items),
    }))
    .filter((g) => g.title !== "" && g.items.length > 0);
}

export function parseLocationAdvantages(value: unknown): ProjectLocationAdvantage[] {
  return rows(value)
    .map((r) => ({
      icon: str(r.icon),
      place: str(r.place),
      distance: str(r.distance),
    }))
    .filter((l) => l.place !== "");
}

export function parsePaymentRows(value: unknown): ProjectPaymentRow[] {
  return rows(value)
    .map((r) => ({
      unit_type: str(r.unit_type),
      tower: str(r.tower),
      area: str(r.area),
      price: str(r.price),
      availability: str(r.availability),
      charges: str(r.charges),
      notes: str(r.notes),
    }))
    // The unit type is the row's label; without it the table reads as blank.
    .filter((p) => p.unit_type !== "");
}

export function parseCharges(value: unknown): ProjectCharge[] {
  return rows(value)
    .map((r) => ({ label: str(r.label), value: str(r.value), note: str(r.note) }))
    .filter((c) => c.label !== "");
}

export function parseSpecs(value: unknown): ProjectSpec[] {
  return rows(value)
    .map((r) => ({ label: str(r.label), value: str(r.value) }))
    .filter((s) => s.label !== "" && s.value !== "");
}

/** Every structured section of a project, parsed and ready to render. */
export function parseProjectContent(project: {
  highlights?: unknown;
  amenity_groups?: unknown;
  location_advantages?: unknown;
  payment_plans?: unknown;
  additional_charges?: unknown;
  key_specs?: unknown;
}) {
  return {
    highlights: parseHighlights(project.highlights),
    amenityGroups: parseAmenityGroups(project.amenity_groups),
    locationAdvantages: parseLocationAdvantages(project.location_advantages),
    paymentRows: parsePaymentRows(project.payment_plans),
    additionalCharges: parseCharges(project.additional_charges),
    keySpecs: parseSpecs(project.key_specs),
  };
}

/**
 * Splits a description into the opening prose and everything after it.
 *
 * These descriptions are written as a lead paragraph followed by ALL-CAPS
 * sections ("PROJECT HIGHLIGHTS", "UNIT MIX", …). The detail page shows the
 * lead on its own, drops the highlight strip underneath it, and only then runs
 * the rest — so the two parts have to come back separately. Splitting here
 * rather than asking admins to fill a second field means every existing
 * project gets the layout without being re-entered.
 */
export function splitDescription(text: string): { lead: string; body: string } {
  const lines = text.split("\n");

  const isHeading = (line: string) => {
    const bare = line.replace(/\*\*/g, "").trim();
    const letters = bare.replace(/[^A-Za-z]/g, "");
    return letters.length >= 4 && letters === letters.toUpperCase();
  };

  const at = lines.findIndex(isHeading);
  if (at > 0) {
    return {
      lead: lines.slice(0, at).join("\n").trim(),
      body: lines.slice(at).join("\n").trim(),
    };
  }
  // No headings at all — treat the first non-empty paragraph as the lead.
  if (at === -1) {
    const firstBreak = lines.findIndex((l, i) => i > 0 && l.trim() === "");
    if (firstBreak > 0) {
      return {
        lead: lines.slice(0, firstBreak).join("\n").trim(),
        body: lines.slice(firstBreak).join("\n").trim(),
      };
    }
  }
  return { lead: "", body: text };
}

/** One unit configuration on the payment plan, with every size priced under it. */
export interface ProjectPaymentGroup {
  unit_type: string;
  tower: string;
  lines: Omit<ProjectPaymentRow, "unit_type" | "tower">[];
}

/**
 * Collapses consecutive rows that describe the same configuration into one
 * block — "1 BHK — A Tower" once, with its 800 and 1000 sq.ft. prices under it,
 * rather than the same heading printed twice.
 *
 * Only *consecutive* rows are merged, so the admin's ordering is still what
 * the page shows: moving a row away from its group splits it, deliberately.
 */
export function groupPaymentRows(rows: ProjectPaymentRow[]): ProjectPaymentGroup[] {
  const groups: ProjectPaymentGroup[] = [];

  for (const { unit_type, tower, ...line } of rows) {
    const last = groups[groups.length - 1];
    if (last && last.unit_type === unit_type && last.tower === tower) {
      last.lines.push(line);
    } else {
      groups.push({ unit_type, tower, lines: [line] });
    }
  }

  return groups;
}

/**
 * Splits the fine print under the payment table into its separate points, and
 * each point into a heading and its body where the admin wrote one.
 *
 * Admins type this as a couple of starred or bolded lines — "**Note:** prices
 * are indicative…", "Direct builder meeting available — contact us…" — and the
 * page shows them as titled cells. A line with no obvious heading keeps its
 * whole text as the body.
 */
export function parseNoteCells(note: string | null | undefined): { heading: string; body: string }[] {
  if (!note?.trim()) return [];

  return note
    .split("\n")
    .map((line) => line.replace(/\*\*/g, "").replace(/^[\s*•\-–—]+/, "").trim())
    .filter(Boolean)
    .map((line) => {
      // "Note: …" / "Direct builder meeting available — …". The heading has to
      // be short, or a sentence with a dash in it would lose its first clause.
      const split = /^(.{3,60}?)\s*(?::|—|–)\s+(.+)$/.exec(line);
      if (split && split[1].split(/\s+/).length <= 7) {
        return { heading: split[1].trim(), body: split[2].trim() };
      }
      return { heading: "", body: line };
    });
}
