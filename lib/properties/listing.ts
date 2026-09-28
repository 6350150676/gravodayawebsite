import { revalidatePath, revalidateTag } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { INVENTORY_TAG } from "@/lib/queries/tags";
import { slugify } from "@/lib/utils";

// Server-side helpers shared by the property actions and the seller-submission
// approval, which both create listings. Kept out of the "use server" files so
// none of them becomes a callable endpoint.

export const PROPERTY_IMAGES_BUCKET = "property-images";
export const SUBMISSION_IMAGES_BUCKET = "submission-images";

// A property's URL is its title. Slugs used to get a Date.now() suffix purely to
// guarantee uniqueness, which left every link 13 digits of noise longer than it
// needed to be — an actual collision now takes a small numeric suffix instead.
export async function uniquePropertySlug(title: string): Promise<string> {
  const supabase = createAdminClient();
  const base = slugify(title) || "property";

  for (let n = 1; n < 50; n++) {
    const candidate = n === 1 ? base : `${base}-${n}`;
    const { data } = await supabase
      .from("properties")
      .select("id")
      .eq("slug", candidate)
      .limit(1);
    if (!data?.length) return candidate;
  }

  // Absurdly unlikely; fall back to the old timestamp scheme rather than fail.
  return `${base}-${Date.now()}`;
}

// Public pages are now statically cached, so every admin write has to bust them
// explicitly — otherwise an edit wouldn't show up until the ISR window expires.
export function revalidatePublicProperties() {
  revalidateTag(INVENTORY_TAG); // the home page's featured list is cached data, not just HTML
  revalidatePath("/");
  revalidatePath("/properties");
  revalidatePath("/properties/[slug]", "page");
  revalidatePath("/projects/[slug]", "page"); // project pages list their units
  revalidatePath("/sitemap.xml");
}

// Adds already-encoded WebP photos after whatever the listing has. Only a
// listing's first-ever photo becomes the cover: adding more on the edit page
// used to mark the first new one as a second cover and restart sort_order at 0.
// Returns how many were stored.
export async function appendPropertyImages(propertyId: string, webps: Buffer[]): Promise<number> {
  if (!webps.length) return 0;
  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("property_images")
    .select("sort_order, is_cover")
    .eq("property_id", propertyId);

  let nextOrder = existing?.length ? Math.max(...existing.map((e) => e.sort_order)) + 1 : 0;
  let hasCover = existing?.some((e) => e.is_cover) ?? false;
  let stored = 0;

  for (const webp of webps) {
    const fileName = `${propertyId}/${crypto.randomUUID()}.webp`;
    const { error } = await supabase.storage
      .from(PROPERTY_IMAGES_BUCKET)
      .upload(fileName, webp, { contentType: "image/webp", upsert: false });

    if (error) {
      console.error("[appendPropertyImages]", error.message);
      continue;
    }

    const { error: rowError } = await supabase.from("property_images").insert({
      property_id: propertyId,
      storage_path: fileName,
      is_cover: !hasCover,
      sort_order: nextOrder++,
    });
    if (rowError) {
      console.error("[appendPropertyImages]", rowError.message);
      await supabase.storage.from(PROPERTY_IMAGES_BUCKET).remove([fileName]);
      continue;
    }
    hasCover = true;
    stored++;
  }

  return stored;
}
