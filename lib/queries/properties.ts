import { createClient } from "@/lib/supabase/server";
import type { PropertyWithRelations, PropertyFilters } from "@/types";
import type { Database } from "@/types/database";

type CityRow = Database["public"]["Tables"]["cities"]["Row"];
type LocalityRow = Database["public"]["Tables"]["localities"]["Row"];
type CategoryRow = Database["public"]["Tables"]["property_categories"]["Row"];

export async function getProperties(filters: PropertyFilters = {}): Promise<PropertyWithRelations[]> {
  const supabase = await createClient();

  let query = supabase
    .from("properties")
    .select(`
      *,
      category:property_categories(id, name, slug),
      city:cities(id, name, slug),
      locality:localities(id, name, slug),
      images:property_images(id, storage_path, is_cover, sort_order)
    `)
    .order("created_at", { ascending: false });

  if (filters.category) query = query.eq("category.slug", filters.category);
  if (filters.city) query = query.eq("city.slug", filters.city);
  if (filters.is_for_rent !== undefined) query = query.eq("is_for_rent", filters.is_for_rent);
  if (filters.min_price) query = query.gte("price", filters.min_price);
  if (filters.max_price) query = query.lte("price", filters.max_price);
  if (filters.search) {
    query = query.textSearch("title", filters.search, { type: "websearch" });
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as PropertyWithRelations[];
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
      images:property_images(id, storage_path, is_cover, sort_order)
    `)
    .eq("id", id)
    .single();

  if (error) return null;
  return data as unknown as PropertyWithRelations;
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
      images:property_images(id, storage_path, is_cover, sort_order)
    `)
    .eq("status", "active")
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as unknown as PropertyWithRelations[];
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
