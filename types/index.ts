export type { Database, PropertyStatus, InquiryStatus, SubmissionStatus } from "./database";

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
  images: { id: string; storage_path: string; is_cover: boolean; sort_order: number }[];
}

export interface PropertyFilters {
  category_id?: number;
  city_id?: number;
  is_for_rent?: boolean;
  min_price?: number;
  max_price?: number;
  search?: string;
}
