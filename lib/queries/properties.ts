import { createClient } from "@/lib/supabase/server";
import type { PropertyWithRelations, PropertyFilters, PaginatedProperties } from "@/types";
import type { Database } from "@/types/database";

type CityRow = Database["public"]["Tables"]["cities"]["Row"];
type LocalityRow = Database["public"]["Tables"]["localities"]["Row"];
type CategoryRow = Database["public"]["Tables"]["property_categories"]["Row"];

/** Number of property cards fetched per page / infinite-scroll batch. */
export const PROPERTIES_PAGE_SIZE = 9;

const CARD_SELECT = `
  *,
  category:property_categories(id, name, slug),
  city:cities(id, name, slug),
  locality:localities(id, name, slug),
  project:projects(id, name, slug),
  images:property_images(id, storage_path, is_cover, sort_order)
`;

/**
 * Fetch one page of active properties matching the filters, plus the total
 * count of all matches (for "X found" + infinite scroll). Only the requested
 * page of rows is transferred — `range()` pushes the LIMIT/OFFSET to Postgres
 * and `{ count: "exact" }` returns the full total in the same round-trip.
 */
export async function getProperties(
  filters: PropertyFilters = {},
  page = 1,
  pageSize = PROPERTIES_PAGE_SIZE,
): Promise<PaginatedProperties> {
  const supabase = await createClient();

  let query = supabase
    .from("properties")
    .select(CARD_SELECT, { count: "exact" })
    .eq("status", "active");

  if (filters.category_id) query = query.eq("category_id", filters.category_id);
  if (filters.city_id)     query = query.eq("city_id", filters.city_id);
  if (filters.is_for_rent !== undefined) query = query.eq("is_for_rent", filters.is_for_rent);
  if (filters.min_price)   query = query.gte("price", filters.min_price);
  if (filters.max_price)   query = query.lte("price", filters.max_price);
  if (filters.min_bedrooms)  query = query.gte("bedrooms", filters.min_bedrooms);
  if (filters.min_bathrooms) query = query.gte("bathrooms", filters.min_bathrooms);
  if (filters.search) {
    // Match across title, description and address. Strip characters that would
    // break PostgREST's `or()` filter grammar (commas, parens, wildcards).
    const q = filters.search.replace(/[,()%*]/g, " ").trim();
    if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%,address.ilike.%${q}%`);
  }

  switch (filters.sort) {
    case "price_asc":  query = query.order("price", { ascending: true }); break;
    case "price_desc": query = query.order("price", { ascending: false }); break;
    default:           query = query.order("created_at", { ascending: false });
  }

  const from = Math.max(0, (page - 1) * pageSize);
  query = query.range(from, from + pageSize - 1);

  const { data, error, count } = await query;
  if (error) {
    console.error("[getProperties]", error.message);
    return { items: [], total: 0 };
  }
  return {
    items: (data ?? []) as unknown as PropertyWithRelations[],
    total: count ?? 0,
  };
}

export async function getPropertyBySlug(slug: string): Promise<PropertyWithRelations | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select(`
      *,
      category:property_categories(id, name, slug),
      city:cities(id, name, slug),
      locality:localities(id, name, slug),
  project:projects(id, name, slug),
      images:property_images(id, storage_path, is_cover, sort_order)
    `)
    .eq("slug", slug)
    .single();

  if (error) return null;
  return data as unknown as PropertyWithRelations;
}

export async function getPropertyById(id: string): Promise<PropertyWithRelations | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select(`
      *,
      category:property_categories(id, name, slug),
      city:cities(id, name, slug),
      locality:localities(id, name, slug),
  project:projects(id, name, slug),
      images:property_images(id, storage_path, is_cover, sort_order)
    `)
    .eq("id", id)
    .single();

  if (error) return null;
  return data as unknown as PropertyWithRelations;
}

export async function getRelatedProperties(
  property: Pick<PropertyWithRelations, "id"> & { city: { id: number }; category: { id: number } },
  limit = 3,
): Promise<PropertyWithRelations[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select(`
      *,
      category:property_categories(id, name, slug),
      city:cities(id, name, slug),
      locality:localities(id, name, slug),
  project:projects(id, name, slug),
      images:property_images(id, storage_path, is_cover, sort_order)
    `)
    .eq("status", "active")
    .eq("city_id", property.city.id)
    .neq("id", property.id)
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[getRelatedProperties]", error.message);
    return [];
  }
  return (data ?? []) as unknown as PropertyWithRelations[];
}

export async function getFeaturedProperties(limit = 6): Promise<PropertyWithRelations[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select(`
      *,
      category:property_categories(id, name, slug),
      city:cities(id, name, slug),
      locality:localities(id, name, slug),
  project:projects(id, name, slug),
      images:property_images(id, storage_path, is_cover, sort_order)
    `)
    .eq("status", "active")
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[getFeaturedProperties]", error.message);
    return [];
  }
  return (data ?? []) as unknown as PropertyWithRelations[];
}

/** Slug + last-updated for every active property, for the sitemap. */
export async function getAllPropertySlugs(): Promise<{ slug: string; updated_at: string }[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select("slug, updated_at")
    .eq("status", "active");

  if (error) {
    console.error("[getAllPropertySlugs]", error.message);
    return [];
  }
  return data ?? [];
}

export async function getCities(): Promise<CityRow[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("cities").select("*").order("name");
  return (data ?? []) as unknown as CityRow[];
}

export async function getLocalitiesByCity(cityId: number): Promise<LocalityRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("localities")
    .select("*")
    .eq("city_id", cityId)
    .order("name");
  return (data ?? []) as unknown as LocalityRow[];
}

export async function getCategories(): Promise<CategoryRow[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("property_categories").select("*").order("id");
  return (data ?? []) as unknown as CategoryRow[];
}
