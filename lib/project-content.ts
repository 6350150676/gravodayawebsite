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
