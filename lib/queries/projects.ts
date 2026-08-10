import { cache } from "react";
import { unstable_cache } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createPublicClient, createUncachedPublicClient } from "@/lib/supabase/public";
import { INVENTORY_TAG } from "@/lib/queries/tags";
import type { ProjectWithRelations, PropertyWithRelations, PropertyFilters } from "@/types";

const PROJECT_SELECT = `
  *,
  city:cities(id, name, slug),
  images:project_images(id, storage_path, is_cover, sort_order)
`;

// Projects answer the same filters as properties, with three differences that
// fall out of what a project is — a whole development rather than one unit:
//
//   • price is a range, so a budget filter is an overlap test, not a comparison;
//   • bedroom/bathroom counts vary per unit within the project, so those
//     filters are ignored rather than used to exclude an otherwise-good match;
//   • projects are sold, never rented.
//
// Every project is returned when no filters are set, so callers can use this
// as a plain listing query too.
export async function getProjects(
  filters: PropertyFilters = {},
): Promise<ProjectWithRelations[]> {
  // Nothing in a project is available to rent — don't pad rental results.
  if (filters.is_for_rent === true) return [];

  const supabase = createPublicClient();

  let query = supabase
    .from("projects")
    .select(PROJECT_SELECT)
    .eq("status", "active");

  if (filters.city_id) query = query.eq("city_id", filters.city_id);
  if (filters.category_id) query = query.contains("category_ids", [filters.category_id]);

  // Budget overlap: keep a project whose range could still contain something
  // the buyer can afford. An open-ended range (null) always overlaps.
  if (filters.min_price)
    query = query.or(`price_max.is.null,price_max.gte.${filters.min_price}`);
  if (filters.max_price)
    query = query.or(`price_min.is.null,price_min.lte.${filters.max_price}`);

  if (filters.search) {
    // strip chars that break PostgREST's or() grammar
    const q = filters.search.replace(/[,()%*]/g, " ").trim();
    if (q)
      query = query.or(
        `name.ilike.%${q}%,tagline.ilike.%${q}%,location.ilike.%${q}%,description.ilike.%${q}%`,
      );
  }

  switch (filters.sort) {
    // Sort by the end of the range the buyer is anchored on: cheapest entry
    // price first when ascending, richest ceiling first when descending.
    case "price_asc":
      query = query.order("price_min", { ascending: true, nullsFirst: false });
      break;
    case "price_desc":
      query = query.order("price_max", { ascending: false, nullsFirst: false });
      break;
    default:
      query = query
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false });
  }

  const { data, error } = await query;
  if (error) {
    console.error("[getProjects]", error.message);
    return [];
  }
  return (data ?? []) as unknown as ProjectWithRelations[];
}

// home page — featured first, newest next
//
// Cached by tag rather than by request URL so an admin write can actually clear
// it, and read through the uncached client so this is the only layer holding a
// copy. See lib/supabase/public.ts for why the default one won't do here.
export const getFeaturedProjects = unstable_cache(
  async (limit = 3): Promise<ProjectWithRelations[]> => {
    const supabase = createUncachedPublicClient();
    const { data, error } = await supabase
      .from("projects")
      .select(PROJECT_SELECT)
      .eq("status", "active")
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit);

    // Throw instead of falling back to []. The home page hides the projects
    // section when the list is empty and is a cached static page, so returning
    // [] on a transient Supabase failure bakes "we have no projects" into the
    // HTML for the whole revalidate window. Throwing leaves the last good
    // render in place and lets Next retry.
    if (error) throw new Error(`[getFeaturedProjects] ${error.message}`);
    return (data ?? []) as unknown as ProjectWithRelations[];
  },
  ["featured-projects"],
  { revalidate: 3600, tags: [INVENTORY_TAG] },
);

// cache() dedupes the generateMetadata + page-body call into one round trip
export const getProjectBySlug = cache(async (slug: string): Promise<ProjectWithRelations | null> => {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_SELECT)
    .eq("slug", slug)
    .single();

  if (error) return null;
  return data as unknown as ProjectWithRelations;
});

export async function getProjectById(id: string): Promise<ProjectWithRelations | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_SELECT)
    .eq("id", id)
    .single();

  if (error) return null;
  return data as unknown as ProjectWithRelations;
}

// Renaming a project moves its URL, so a slug that matches nothing today may
// still be a slug the project used to live at. Returns where it moved to, or
// null for a genuinely unknown slug. cache()d because the detail page checks it
// from both generateMetadata and the page body on every miss.
export const getProjectSlugRedirect = cache(async (oldSlug: string): Promise<string | null> => {
  const supabase = createPublicClient();
  const { data: retired } = await supabase
    .from("project_slug_history")
    .select("project_id")
    .eq("slug", oldSlug)
    .maybeSingle();

  if (!retired) return null;

  const { data: project } = await supabase
    .from("projects")
    .select("slug")
    .eq("id", retired.project_id)
    .eq("status", "active")
    .maybeSingle();

  return project?.slug ?? null;
});

// for the sitemap
export async function getAllProjectSlugs(): Promise<{ slug: string; updated_at: string }[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("projects")
    .select("slug, updated_at")
    .eq("status", "active");

  if (error) {
    console.error("[getAllProjectSlugs]", error.message);
    return [];
  }
  return data ?? [];
}

export async function getPropertiesByProject(projectId: string): Promise<PropertyWithRelations[]> {
  const supabase = createPublicClient();
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
    .eq("project_id", projectId)
    .order("price", { ascending: true });

  if (error) {
    console.error("[getPropertiesByProject]", error.message);
    return [];
  }
  return (data ?? []) as unknown as PropertyWithRelations[];
}
