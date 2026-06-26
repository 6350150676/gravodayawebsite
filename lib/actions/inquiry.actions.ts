"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { inquirySchema } from "@/lib/validations/inquiry";
import type { Database, InquiryStatus } from "@/types/database";

type InquiryInsert = Database["public"]["Tables"]["inquiries"]["Insert"];

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  return user;
}

export type InquiryFormState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

/**
 * Public-facing: a visitor submits an inquiry about a property (or a general
 * one when no property_id is given). Validated with Zod; the anon RLS policy
 * `inquiries_public_insert` permits the insert.
 */
export async function createInquiryAction(
  _prev: InquiryFormState,
  formData: FormData,
): Promise<InquiryFormState> {
  const parsed = inquirySchema.safeParse({
    name: formData.get("name") ?? "",
    phone: formData.get("phone") ?? "",
    email: formData.get("email") ?? "",
    message: formData.get("message") ?? "",
    property_id: formData.get("property_id") || undefined,
    honeypot: formData.get("company") ?? "", // bots fill the hidden "company" field
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, error: "Please fix the highlighted fields.", fieldErrors };
  }

  const { honeypot, name, phone, email, message, property_id } = parsed.data;
  if (honeypot) return { ok: true }; // silently drop bots

  const payload: InquiryInsert = {
    name,
    phone,
    email: email || null,
    message: message || null,
    property_id: property_id ?? null,
  };

  // Writes use the service-role client (server-side only), consistent with the
  // rest of the codebase. Input is already validated above; RLS also permits
  // anonymous inserts via the `inquiries_public_insert` policy.
  const supabase = createAdminClient();
  const { error } = await supabase.from("inquiries").insert(payload);

  if (error) {
    console.error("[createInquiryAction]", error.message);
    return { ok: false, error: "Something went wrong. Please try again or call us." };
  }

  return { ok: true };
}

export async function updateInquiryStatusAction(id: string, status: InquiryStatus) {
  await requireAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("inquiries")
    .update({ status })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/inquiries");
}
