import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { SUBMISSION_IMAGES_BUCKET } from "@/lib/properties/listing";
import type { Database } from "@/types/database";

type SubmissionRow = Database["public"]["Tables"]["seller_submissions"]["Row"];

export interface SubmissionImage {
  id: string;
  storage_path: string;
  sort_order: number;
  /** signed, expires after an hour; null if the file couldn't be found */
  url: string | null;
}

export interface SubmissionWithImages extends SubmissionRow {
  images: SubmissionImage[];
  /** the listing an approval created */
  property: { id: string; slug: string; title: string; status: string } | null;
}

const SIGNED_URL_TTL = 60 * 60;

// Admin only. Rows come through the session client, so RLS (is_admin) decides
// what's returned; only the photos of rows that came back get signed.
export async function getSubmissions(status?: string): Promise<SubmissionWithImages[]> {
  const supabase = await createClient();

  let query = supabase
    .from("seller_submissions")
    .select(`
      *,
      images:submission_images(id, storage_path, sort_order),
      property:properties(id, slug, title, status)
    `)
    .order("created_at", { ascending: false });

  if (status && status !== "all") query = query.eq("status", status);

  // Throw rather than return [], which would read as "no submissions". The
  // usual cause is the submission_review migration not having been run.
  const { data, error } = await query;
  if (error) throw new Error(`Couldn't load submissions: ${error.message}`);

  const rows = (data ?? []) as unknown as (Omit<SubmissionWithImages, "images"> & {
    images: Omit<SubmissionImage, "url">[];
  })[];

  // The photos sit in a private bucket, so each needs a signed URL.
  const paths = rows.flatMap((r) => r.images.map((i) => i.storage_path));
  const signed = new Map<string, string>();
  if (paths.length) {
    const { data: urls, error: signError } = await createAdminClient()
      .storage.from(SUBMISSION_IMAGES_BUCKET)
      .createSignedUrls(paths, SIGNED_URL_TTL);
    if (signError) console.error("[getSubmissions] sign", signError.message);
    for (const u of urls ?? []) {
      if (u.path && u.signedUrl) signed.set(u.path, u.signedUrl);
    }
  }

  return rows.map((r) => ({
    ...r,
    images: [...r.images]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((i) => ({ ...i, url: signed.get(i.storage_path) ?? null })),
  }));
}
