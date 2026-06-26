"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { propertySchema } from "@/lib/validations/property";
import { slugify } from "@/lib/utils";

/** Convert a FormData value to a finite number. Returns undefined for empty, NaN, or Infinity. */
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

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  return user;
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
    address: (formData.get("address") as string) || undefined,
    area_sqft: toNum(formData.get("area_sqft")),
    bedrooms: toNum(formData.get("bedrooms")),
    bathrooms: toNum(formData.get("bathrooms")),
    amenities: formData.getAll("amenities") as string[],
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

  const slug = slugify(parsed.data.title) + "-" + Date.now();

  const { data: property, error } = await supabase
    .from("properties")
    .insert({ ...parsed.data, slug })
    .select("id")
    .single();

  if (error) return error.message;

  const images = formData.getAll("images") as File[];
  await uploadPropertyImages(property.id, images);

  revalidatePath("/admin/properties");
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

  const { error } = await supabase
    .from("properties")
    .update(parsed.data)
    .eq("id", id);

  if (error) return error.message;

  const images = formData.getAll("images") as File[];
  const validImages = images.filter((f) => f.size > 0);
  if (validImages.length > 0) {
    await uploadPropertyImages(id, validImages);
  }

  revalidatePath("/admin/properties");
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
  redirect("/admin/properties");
}

export async function deletePropertyImageAction(imageId: string, storagePath: string, propertyId: string) {
  await requireAdmin();
  const supabase = createAdminClient();

  await supabase.storage.from("property-images").remove([storagePath]);
  await supabase.from("property_images").delete().eq("id", imageId);

  revalidatePath(`/admin/properties/${propertyId}/edit`);
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
}

async function uploadPropertyImages(propertyId: string, files: File[]) {
  const supabase = createAdminClient();
  const sharp = (await import("sharp")).default;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!file || file.size === 0) continue;

    const buffer = Buffer.from(await file.arrayBuffer());
    const webp = await sharp(buffer)
      .resize(1280, 960, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();

    const fileName = `${propertyId}/${crypto.randomUUID()}.webp`;

    const { error } = await supabase.storage
      .from("property-images")
      .upload(fileName, webp, { contentType: "image/webp", upsert: false });

    if (error) continue;

    await supabase.from("property_images").insert({
      property_id: propertyId,
      storage_path: fileName,
      is_cover: i === 0,
      sort_order: i,
    });
  }
}
