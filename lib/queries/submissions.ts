import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type SubmissionRow = Database["public"]["Tables"]["seller_submissions"]["Row"];

export interface SubmissionWithImages extends SubmissionRow {
  images: { id: string; storage_path: string }[];
}

export async function getSubmissions(status?: string): Promise<SubmissionWithImages[]> {
  const supabase = await createClient();

  let query = supabase
    .from("seller_submissions")
    .select("*, images:submission_images(id, storage_path)")
    .order("created_at", { ascending: false });

  if (status && status !== "all") query = query.eq("status", status);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as SubmissionWithImages[];
}
