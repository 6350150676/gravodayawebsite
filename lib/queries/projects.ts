import { createClient } from "@/lib/supabase/server";
import type { ProjectWithRelations, PropertyWithRelations } from "@/types";

const PROJECT_SELECT = `
  *,
  city:cities(id, name, slug),
  images:project_images(id, storage_path, is_cover, sort_order)
`;

export async function getProjects(): Promise<ProjectWithRelations[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_SELECT)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getProjects]", error.message);
    return [];
  }
  return (data ?? []) as unknown as ProjectWithRelations[];
}

export async function getProjectBySlug(slug: string): Promise<ProjectWithRelations | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select(PROJECT_SELECT)
    .eq("slug", slug)
    .single();

  if (error) return null;
  return data as unknown as ProjectWithRelations;
}

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

// for the sitemap
export async function getAllProjectSlugs(): Promise<{ slug: string; updated_at: string }[]> {
  const supabase = await createClient();
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
    .eq("project_id", projectId)
    .order("price", { ascending: true });

  if (error) {
    console.error("[getPropertiesByProject]", error.message);
    return [];
  }
  return (data ?? []) as unknown as PropertyWithRelations[];
}
