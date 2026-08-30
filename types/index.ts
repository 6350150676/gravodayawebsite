export type { Database, PropertyStatus, InquiryStatus, SubmissionStatus, ProjectStatus } from "./database";

export interface PropertyWithRelations {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  price_label: string | null;
  area_sqft: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  amenities: string[];
  is_for_rent: boolean;
  is_featured: boolean;
  status: import("./database").PropertyStatus;
  map_lat: number | null;
  map_lng: number | null;
  address: string | null;
  created_at: string;
  category: { id: number; name: string; slug: string };
  city: { id: number; name: string; slug: string };
  locality: { id: number; name: string; slug: string } | null;
  project: { id: string; name: string; slug: string } | null;
  images: { id: string; storage_path: string; is_cover: boolean; sort_order: number }[];
}

// ── Project page content ────────────────────────────────────────────
// Stored as jsonb arrays on `projects` (see the project_page_content
// migration) and read back through lib/project-content.ts, which
// coerces whatever is in the column into these shapes.

/** One card in the "Key Highlights" grid. */
export interface ProjectHighlight {
  icon: string;
  title: string;
  description: string;
}

/** One amenity category card, e.g. "Signature Amenities". */
export interface ProjectAmenityGroup {
  icon: string;
  title: string;
  items: string[];
}

/** One nearby place in the "Location Advantage" list. */
export interface ProjectLocationAdvantage {
  icon: string;
  place: string;
  /** Free text — "2 mins", "1.4 km", "25 min drive". */
  distance: string;
}

/**
 * One row of the payment plan. Every field is free text: projects price in
 * wildly different units ("₹85 L onwards", "On request", "1,245 sq.ft."), and
 * forcing numbers here would make half of them unenterable.
 */
export interface ProjectPaymentRow {
  unit_type: string;
  tower: string;
  area: string;
  price: string;
  availability: string;
  charges: string;
  notes: string;
}

/** A charge on top of the base price — PLC, floor rise, club membership. */
export interface ProjectCharge {
  label: string;
  value: string;
  note: string;
}

/** A quick fact shown in the overview strip, e.g. "Possession · Dec 2026". */
export interface ProjectSpec {
  label: string;
  value: string;
}

export interface ProjectWithRelations {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  location: string | null;
  price_min: number | null;
  price_max: number | null;
  category_ids: number[];
  description: string;
  payment_plan: string | null;
  brochure_url: string | null;

  // Structured detail-page content. Optional on the type because a database
  // that hasn't run the project_page_content migration simply won't return
  // them — the parsers in lib/project-content.ts turn undefined into [].
  overview?: string | null;
  highlights?: unknown;
  amenity_groups?: unknown;
  location_advantages?: unknown;
  payment_plans?: unknown;
  additional_charges?: unknown;
  key_specs?: unknown;
  payment_note?: string | null;
  rera_number?: string | null;
  contact_phone?: string | null;
  contact_whatsapp?: string | null;

  is_featured: boolean;
  status: import("./database").ProjectStatus;
  created_at: string;
  city: { id: number; name: string; slug: string } | null;
  images: { id: string; storage_path: string; is_cover: boolean; sort_order: number }[];
}

// newest is the implicit default (no sort param)
export type PropertySort = "price_asc" | "price_desc";

export interface PropertyFilters {
  category_id?: number;
  city_id?: number;
  is_for_rent?: boolean;
  min_price?: number;
  max_price?: number;
  min_bedrooms?: number;
  min_bathrooms?: number;
  search?: string;
  sort?: PropertySort;
}

export interface PaginatedProperties {
  items: PropertyWithRelations[];
  total: number;
}

// A search hits both tables: projects are whole developments, properties are
// individual units. The same filter set applies to both — see getSearchResults.
export interface SearchResults {
  projects: ProjectWithRelations[];
  properties: PropertyWithRelations[];
  propertyTotal: number;
  /** projects + properties, i.e. what the "N results" counters should show */
  total: number;
}

// editable site content (see lib/site-content)

export type SiteSettings = Record<string, string>;

export interface SiteStat {
  label: string;
  value: number;
  suffix: string;
}

export interface HeroSlide {
  badge: string | null;
  title: string;
  subtitle: string | null;
  image_url: string;
}

export interface IntentCard {
  title: string;
  subtitle: string | null;
  description: string | null;
  cta: string | null;
  href: string;
  image_url: string | null;
  accent: string;
}
