"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { projectSchema } from "@/lib/validations/project";
import { slugify } from "@/lib/utils";

function toNum(value: FormDataEntryValue | null): number | undefined {
  if (!value || value === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function validationError(err: ReturnType<typeof projectSchema.safeParse>): string {
  if (err.success) return "";
  const e = err.error.errors[0];
  const field = e.path.length ? `${String(e.path[0]).replace(/_/g, " ")}: ` : "";
  return `${field}${e.message}`;
}

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  return user;
}

function parseFormData(formData: FormData) {
  return {
    name: formData.get("name") as string,
    tagline: (formData.get("tagline") as string) || undefined,
    location: (formData.get("location") as string) || undefined,
    city_id: toNum(formData.get("city_id")),
    description: formData.get("description") as string,
    payment_plan: (formData.get("payment_plan") as string) || undefined,
    brochure_url: (formData.get("brochure_url") as string) || undefined,
    is_featured: formData.get("is_featured") === "true",
    status: (formData.get("status") as string) || "active",
  };
}

export async function createProjectAction(
  _prev: string | null,
  formData: FormData,
): Promise<string | null> {
  await requireAdmin();
  const supabase = createAdminClient();

  const parsed = projectSchema.safeParse(parseFormData(formData));
  if (!parsed.success) return validationError(parsed);

  const slug = slugify(parsed.data.name) + "-" + Date.now();

  const { data: project, error } = await supabase
    .from("projects")
    .insert({ ...parsed.data, slug })
    .select("id")
    .single();

  if (error) return error.message;

  const images = formData.getAll("images") as File[];
  await uploadProjectImages(project.id, images);

  revalidatePath("/admin/projects");
  redirect("/admin/projects");
}

export async function updateProjectAction(
  id: string,
  _prev: string | null,
  formData: FormData,
): Promise<string | null> {
  await requireAdmin();
  const supabase = createAdminClient();

  const parsed = projectSchema.safeParse(parseFormData(formData));
  if (!parsed.success) return validationError(parsed);

  const { error } = await supabase
    .from("projects")
    .update(parsed.data)
    .eq("id", id);

  if (error) return error.message;

  const images = formData.getAll("images") as File[];
  const validImages = images.filter((f) => f.size > 0);
  if (validImages.length > 0) {
    await uploadProjectImages(id, validImages);
  }

  revalidatePath("/admin/projects");
  revalidatePath(`/admin/projects/${id}/edit`);
  redirect("/admin/projects");
}

export async function deleteProjectAction(id: string) {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data: images } = await supabase
    .from("project_images")
    .select("storage_path")
    .eq("project_id", id);

  if (images?.length) {
    await supabase.storage
      .from("project-images")
      .remove(images.map((i) => i.storage_path));
  }

  // Unlink any properties pointing at this project rather than blocking the delete.
  await supabase.from("properties").update({ project_id: null }).eq("project_id", id);

  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/projects");
  redirect("/admin/projects");
}

export async function deleteProjectImageAction(imageId: string, storagePath: string, projectId: string) {
  await requireAdmin();
  const supabase = createAdminClient();

  await supabase.storage.from("project-images").remove([storagePath]);
  await supabase.from("project_images").delete().eq("id", imageId);

  revalidatePath(`/admin/projects/${projectId}/edit`);
}

export async function setProjectCoverImageAction(imageId: string, projectId: string) {
  await requireAdmin();
  const supabase = createAdminClient();

  await supabase
    .from("project_images")
    .update({ is_cover: false })
    .eq("project_id", projectId);

  await supabase
    .from("project_images")
    .update({ is_cover: true })
    .eq("id", imageId);

  revalidatePath(`/admin/projects/${projectId}/edit`);
}

async function uploadProjectImages(projectId: string, files: File[]) {
  const supabase = createAdminClient();
  const sharp = (await import("sharp")).default;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!file || file.size === 0) continue;

    const buffer = Buffer.from(await file.arrayBuffer());
    const webp = await sharp(buffer)
      .resize(1600, 1200, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer();

    const fileName = `${projectId}/${crypto.randomUUID()}.webp`;

    const { error } = await supabase.storage
      .from("project-images")
      .upload(fileName, webp, { contentType: "image/webp", upsert: false });

    if (error) continue;

    await supabase.from("project_images").insert({
      project_id: projectId,
      storage_path: fileName,
      is_cover: i === 0,
      sort_order: i,
    });
  }
}
