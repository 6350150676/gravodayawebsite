"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { inquirySchema } from "@/lib/validations/inquiry";
import { notifyTeam } from "@/lib/notifications/notify-team";
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
    honeypot: formData.get("company") ?? "", // hidden field, bots fill it
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
  if (honeypot) return { ok: true };

  const payload: InquiryInsert = {
    name,
    phone,
    email: email || null,
    message: message || null,
    property_id: property_id ?? null,
  };

  const supabase = createAdminClient();
  const { error } = await supabase.from("inquiries").insert(payload);

  if (error) {
    console.error("[createInquiryAction]", error.message);
    return { ok: false, error: "Something went wrong. Please try again or call us." };
  }

  let propertyTitle: string | null = null;
  let propertySlug: string | null = null;
  if (property_id) {
    const { data: prop } = await supabase
      .from("properties")
      .select("title, slug")
      .eq("id", property_id)
      .single();
    propertyTitle = prop?.title ?? null;
    propertySlug = prop?.slug ?? null;
  }
  await notifyTeam({
    name,
    phone,
    email,
    message,
    subject: propertyTitle ?? "General Inquiry",
    propertyTitle,
    propertyUrl: propertyTitle && propertySlug
      ? `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/properties/${propertySlug}`
      : null,
  });

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
