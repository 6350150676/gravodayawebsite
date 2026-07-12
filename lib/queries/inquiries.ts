import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type InquiryRow = Database["public"]["Tables"]["inquiries"]["Row"];

export interface InquiryWithProperty extends InquiryRow {
  property: { id: string; title: string; slug: string } | null;
}

export async function getInquiries(status?: string): Promise<InquiryWithProperty[]> {
  const supabase = await createClient();

  let query = supabase
    .from("inquiries")
    .select("*, property:properties(id, title, slug)")
    .order("created_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[getInquiries]", error.message);
    return [];
  }
  return (data ?? []) as unknown as InquiryWithProperty[];
}

export async function getInquiryById(id: string): Promise<InquiryWithProperty | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("inquiries")
    .select("*, property:properties(id, title, slug)")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as unknown as InquiryWithProperty;
}
