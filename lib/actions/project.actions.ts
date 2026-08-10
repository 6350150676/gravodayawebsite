"use server";

import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { INVENTORY_TAG } from "@/lib/queries/tags";
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
    price_min: toNum(formData.get("price_min")),
    price_max: toNum(formData.get("price_max")),
    category_ids: formData
      .getAll("category_ids")
      .map((v) => Number(v))
      .filter((n) => Number.isInteger(n) && n > 0),
    description: formData.get("description") as string,
    payment_plan: (formData.get("payment_plan") as string) || undefined,
    brochure_url: (formData.get("brochure_url") as string) || undefined,
    is_featured: formData.get("is_featured") === "true",
    status: (formData.get("status") as string) || "active",
  };
}


// A project's URL is its name, so a rename has to move the URL too — otherwise
// "Luxury Property" keeps living at /projects/ganga-vista-…. Slugs must stay
// unique across both live projects and retired slugs (which still redirect), so
// a taken slug gets a numeric suffix rather than a timestamp.
async function uniqueProjectSlug(name: string, excludeId?: string): Promise<string> {
  const supabase = createAdminClient();
  const base = slugify(name) || "project";

  for (let n = 1; n < 50; n++) {
    const candidate = n === 1 ? base : `${base}-${n}`;

    let taken = supabase.from("projects").select("id").eq("slug", candidate);
    if (excludeId) taken = taken.neq("id", excludeId);
    const [{ data: live }, { data: retired }] = await Promise.all([
      taken.limit(1),
      supabase
        .from("project_slug_history")
        .select("project_id")
        .eq("slug", candidate)
        .neq("project_id", excludeId ?? "00000000-0000-0000-0000-000000000000")
        .limit(1),
    ]);

    if (!live?.length && !retired?.length) return candidate;
  }

  // Absurdly unlikely; fall back to the old timestamp scheme rather than fail.
  return `${base}-${Date.now()}`;
}

// Public pages are now statically cached, so every admin write has to bust them
// explicitly — otherwise an edit wouldn't show up until the ISR window expires.
//
// revalidatePath only discards rendered HTML. The home page's featured lists
// are cached data as well, so they need the tag too — without it the page
// regenerates straight back onto the same stale copy.
function revalidatePublicProjects() {
  revalidateTag(INVENTORY_TAG);
  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath("/projects/[slug]", "page");
  revalidatePath("/properties/[slug]", "page"); // unit pages link their project
  revalidatePath("/sitemap.xml");
}

export async function createProjectAction(
  _prev: string | null,
  formData: FormData,
): Promise<string | null> {
  await requireAdmin();
  const supabase = createAdminClient();

  const parsed = projectSchema.safeParse(parseFormData(formData));
  if (!parsed.success) return validationError(parsed);

  const slug = await uniqueProjectSlug(parsed.data.name);

  const { data: project, error } = await supabase
    .from("projects")
    .insert({ ...parsed.data, slug })
    .select("id")
    .single();

  if (error) return error.message;

  const images = formData.getAll("images") as File[];
  await uploadProjectImages(project.id, images);

  revalidatePath("/admin/projects");
  revalidatePublicProjects();
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

  const { data: current } = await supabase
    .from("projects")
    .select("name, slug")
    .eq("id", id)
    .single();
  if (!current) return "Project not found";

  // Renaming moves the URL; the old one is kept alive as a redirect below.
  const slug =
    parsed.data.name === current.name
      ? current.slug
      : await uniqueProjectSlug(parsed.data.name, id);

  const { error } = await supabase
    .from("projects")
    .update({
      ...parsed.data,
      slug,
      // undefined is dropped from the JSON payload, which would leave the old
      // value sitting there when an admin clears the field — send null so every
      // optional field can actually be emptied from the form.
      tagline: parsed.data.tagline ?? null,
      location: parsed.data.location ?? null,
      city_id: parsed.data.city_id ?? null,
      price_min: parsed.data.price_min ?? null,
      price_max: parsed.data.price_max ?? null,
      payment_plan: parsed.data.payment_plan ?? null,
      brochure_url: parsed.data.brochure_url || null,
    })
    .eq("id", id);

  if (error) return error.message;

  if (slug !== current.slug) {
    // Retire the old URL into the redirect table, and make sure the slug we just
    // moved onto isn't still listed as a redirect from an earlier rename.
    await supabase
      .from("project_slug_history")
      .upsert({ slug: current.slug, project_id: id }, { onConflict: "slug" });
    await supabase.from("project_slug_history").delete().eq("slug", slug);
  }

  const images = formData.getAll("images") as File[];
  const validImages = images.filter((f) => f.size > 0);
  if (validImages.length > 0) {
    await uploadProjectImages(id, validImages);
  }

  revalidatePath("/admin/projects");
  revalidatePublicProjects();
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
  revalidatePublicProjects();
}

export async function deleteProjectImageAction(imageId: string, storagePath: string, projectId: string) {
  await requireAdmin();
  const supabase = createAdminClient();

  await supabase.storage.from("project-images").remove([storagePath]);
  await supabase.from("project_images").delete().eq("id", imageId);

  revalidatePath(`/admin/projects/${projectId}/edit`);
  revalidatePublicProjects();
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
  revalidatePublicProjects();
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
