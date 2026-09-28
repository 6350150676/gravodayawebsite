"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/require-admin";
import { toListingWebp } from "@/lib/images/listing-image";
import {
  appendPropertyImages,
  revalidatePublicProperties,
  uniquePropertySlug,
} from "@/lib/properties/listing";
import { propertySchema } from "@/lib/validations/property";

function toNum(value: FormDataEntryValue | null): number | undefined {
  if (!value || value === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function validationError(err: ReturnType<typeof propertySchema.safeParse>): string {
  if (err.success) return "";
  const e = err.error.errors[0];
  const field = e.path.length ? `${String(e.path[0]).replace(/_/g, " ")}: ` : "";
  return `${field}${e.message}`;
}

function parseFormData(formData: FormData) {
  return {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    price: toNum(formData.get("price")),
    price_label: (formData.get("price_label") as string) || undefined,
    category_id: toNum(formData.get("category_id")),
    city_id: toNum(formData.get("city_id")),
    locality_id: toNum(formData.get("locality_id")),
    project_id: (formData.get("project_id") as string) || undefined,
    address: (formData.get("address") as string) || undefined,
    area_sqft: toNum(formData.get("area_sqft")),
    bedrooms: toNum(formData.get("bedrooms")),
    bathrooms: toNum(formData.get("bathrooms")),
    amenities: formData.getAll("amenities") as string[],
    // one per line in the form
    selling_points: String(formData.get("selling_points") ?? "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
    is_for_rent: formData.get("is_for_rent") === "true",
    is_featured: formData.get("is_featured") === "true",
    status: (formData.get("status") as string) || "active",
    map_lat: toNum(formData.get("map_lat")),
    map_lng: toNum(formData.get("map_lng")),
  };
}


export async function createPropertyAction(
  _prev: string | null,
  formData: FormData,
): Promise<string | null> {
  await requireAdmin();
  const supabase = createAdminClient();

  const parsed = propertySchema.safeParse(parseFormData(formData));
  if (!parsed.success) return validationError(parsed);

  const slug = await uniquePropertySlug(parsed.data.title);

  const { data: property, error } = await supabase
    .from("properties")
    .insert({ ...parsed.data, slug })
    .select("id")
    .single();

  if (error) return error.message;

  const images = formData.getAll("images") as File[];
  await uploadPropertyImages(property.id, images);

  revalidatePath("/admin/properties");
  revalidatePublicProperties();
  redirect("/admin/properties");
}

export async function updatePropertyAction(
  id: string,
  _prev: string | null,
  formData: FormData,
): Promise<string | null> {
  await requireAdmin();
  const supabase = createAdminClient();

  const parsed = propertySchema.safeParse(parseFormData(formData));
  if (!parsed.success) return validationError(parsed);

  // A field emptied in the form parses to undefined, which the JSON body drops
  // — so without this, clearing e.g. the bedrooms left the old value in place.
  const d = parsed.data;
  const { error } = await supabase
    .from("properties")
    .update({
      ...d,
      price_label: d.price_label ?? null,
      locality_id: d.locality_id ?? null,
      project_id: d.project_id ?? null,
      address: d.address ?? null,
      area_sqft: d.area_sqft ?? null,
      bedrooms: d.bedrooms ?? null,
      bathrooms: d.bathrooms ?? null,
      map_lat: d.map_lat ?? null,
      map_lng: d.map_lng ?? null,
    })
    .eq("id", id);

  if (error) return error.message;

  const images = formData.getAll("images") as File[];
  const validImages = images.filter((f) => f.size > 0);
  if (validImages.length > 0) {
    await uploadPropertyImages(id, validImages);
  }

  revalidatePath("/admin/properties");
  revalidatePublicProperties();
  revalidatePath(`/admin/properties/${id}/edit`);
  redirect("/admin/properties");
}

export async function deletePropertyAction(id: string) {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data: images } = await supabase
    .from("property_images")
    .select("storage_path")
    .eq("property_id", id);

  if (images?.length) {
    await supabase.storage
      .from("property-images")
      .remove(images.map((i) => i.storage_path));
  }

  const { error } = await supabase.from("properties").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/properties");
  revalidatePublicProperties();
}

export async function deletePropertyImageAction(imageId: string, storagePath: string, propertyId: string) {
  await requireAdmin();
  const supabase = createAdminClient();

  await supabase.storage.from("property-images").remove([storagePath]);
  await supabase.from("property_images").delete().eq("id", imageId);

  revalidatePath(`/admin/properties/${propertyId}/edit`);
  revalidatePublicProperties();
}

export async function setCoverImageAction(imageId: string, propertyId: string) {
  await requireAdmin();
  const supabase = createAdminClient();

  await supabase
    .from("property_images")
    .update({ is_cover: false })
    .eq("property_id", propertyId);

  await supabase
    .from("property_images")
    .update({ is_cover: true })
    .eq("id", imageId);

  revalidatePath(`/admin/properties/${propertyId}/edit`);
  revalidatePublicProperties();
}

// Moves one photo a step earlier or later. The cover always shows first on the
// public page, so only the other photos are reordered here — the cover changes
// through setCoverImageAction.
export async function movePropertyImageAction(imageId: string, propertyId: string, direction: -1 | 1) {
  await requireAdmin();
  if (direction !== -1 && direction !== 1) return;
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("property_images")
    .select("id, is_cover")
    .eq("property_id", propertyId)
    .order("sort_order")
    .order("created_at");

  const ids = (data ?? []).filter((img) => !img.is_cover).map((img) => img.id);
  const from = ids.indexOf(imageId);
  const to = from + direction;
  if (from < 0 || to < 0 || to >= ids.length) return;
  [ids[from], ids[to]] = [ids[to], ids[from]];

  // the cover shows first whatever its sort_order, so just renumber the rest
  const results = await Promise.all(
    ids.map((id, i) => supabase.from("property_images").update({ sort_order: i + 1 }).eq("id", id)),
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) throw new Error(failed.error.message);

  revalidatePath(`/admin/properties/${propertyId}/edit`);
  revalidatePublicProperties();
}

async function uploadPropertyImages(propertyId: string, files: File[]) {
  const webps: Buffer[] = [];
  for (const file of files) {
    if (!file || file.size === 0) continue;
    try {
      webps.push(await toListingWebp(file));
    } catch (err) {
      console.error("[uploadPropertyImages]", err instanceof Error ? err.message : err);
    }
  }
  await appendPropertyImages(propertyId, webps);
}
