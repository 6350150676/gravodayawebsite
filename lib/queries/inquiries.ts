import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type InquiryRow = Database["public"]["Tables"]["inquiries"]["Row"];

export interface InquiryWithProperty extends InquiryRow {
  property: { id: string; title: string; slug: string } | null;
  project: { id: string; name: string; slug: string } | null;
}

const SELECT_WITH_PROJECT = "*, property:properties(id, title, slug), project:projects(id, name, slug)";
const SELECT_WITHOUT_PROJECT = "*, property:properties(id, title, slug)";

// PGRST200 means the inquiries.project_id migration hasn't been applied to
// this database yet — fall back so the admin panel keeps working meanwhile.
function isMissingProjectRelationship(error: { code?: string } | null): boolean {
  return error?.code === "PGRST200";
}

export async function getInquiries(status?: string): Promise<InquiryWithProperty[]> {
  const supabase = await createClient();

  let query: any = supabase.from("inquiries").select(SELECT_WITH_PROJECT).order("created_at", { ascending: false });
  if (status && status !== "all") query = query.eq("status", status);
  let { data, error } = await query;

  if (isMissingProjectRelationship(error)) {
    let fallback: any = supabase.from("inquiries").select(SELECT_WITHOUT_PROJECT).order("created_at", { ascending: false });
    if (status && status !== "all") fallback = fallback.eq("status", status);
    ({ data, error } = await fallback);
    if (data) data = data.map((row: Record<string, unknown>) => ({ ...row, project: null }));
  }

  if (error) {
    console.error("[getInquiries]", error.message);
    return [];
  }
  return (data ?? []) as unknown as InquiryWithProperty[];
}

export async function getInquiryById(id: string): Promise<InquiryWithProperty | null> {
  const supabase = await createClient();

  let { data, error }: any = await supabase
    .from("inquiries")
    .select(SELECT_WITH_PROJECT)
    .eq("id", id)
    .single();

  if (isMissingProjectRelationship(error)) {
    const fallback: any = await supabase
      .from("inquiries")
      .select(SELECT_WITHOUT_PROJECT)
      .eq("id", id)
      .single();
    data = fallback.data ? { ...fallback.data, project: null } : null;
    error = fallback.error;
  }

  if (error) return null;
  return data as unknown as InquiryWithProperty;
}
