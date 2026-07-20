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

export interface ProjectWithRelations {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  location: string | null;
  description: string;
  payment_plan: string | null;
  brochure_url: string | null;
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
