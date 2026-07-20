"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyTeam } from "@/lib/notifications/notify-team";
import type { SubmissionStatus } from "@/types/database";

const submissionSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  property_type: z.string().min(1, "Please select a property type"),
  city: z.string().min(1, "Please select a city"),
  locality: z.string().max(100).optional(),
  description: z.string().min(10, "Please describe your property (min 10 characters)").max(2000),
  asking_price: z.string().optional(),
  honeypot: z.string().optional(),
});

export type SubmissionFormState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function createSubmissionAction(
  _prev: SubmissionFormState,
  formData: FormData,
): Promise<SubmissionFormState> {
  const parsed = submissionSchema.safeParse({
    name: formData.get("name") ?? "",
    phone: formData.get("phone") ?? "",
    email: formData.get("email") ?? "",
    property_type: formData.get("property_type") ?? "",
    city: formData.get("city") ?? "",
    locality: formData.get("locality") ?? "",
    description: formData.get("description") ?? "",
    asking_price: formData.get("asking_price") ?? "",
    honeypot: formData.get("company") ?? "",
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, error: "Please fix the highlighted fields.", fieldErrors };
  }

  const { honeypot, name, phone, email, property_type, city, locality, description, asking_price } = parsed.data;
  if (honeypot) return { ok: true };

  const priceNum = asking_price ? parseFloat(asking_price.replace(/,/g, "")) : null;

  const supabase = createAdminClient();
  const { error } = await supabase.from("seller_submissions").insert({
    name,
    phone,
    email: email || null,
    property_type,
    city,
    locality: locality || null,
    description,
    asking_price: priceNum && !isNaN(priceNum) ? priceNum : null,
  });

  if (error) {
    console.error("[createSubmissionAction]", error.message);
    return { ok: false, error: "Something went wrong. Please try again or call us directly." };
  }

  const summary = `Property Type: ${property_type}\nCity: ${city}${locality ? `, ${locality}` : ""}\nAsking Price: ${asking_price || "Not specified"}\n\n${description}`;
  await notifyTeam({
    name,
    phone,
    email,
    message: summary,
    subject: `Seller Listing — ${property_type} in ${city}`,
    propertyTitle: `New Property Listing — ${property_type} in ${city}`,
    propertyUrl: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/admin/submissions`,
  });

  return { ok: true };
}

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
}

export async function updateSubmissionStatusAction(
  id: string,
  status: SubmissionStatus,
  adminNotes?: string,
) {
  await requireAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("seller_submissions")
    .update({ status, ...(adminNotes !== undefined ? { admin_notes: adminNotes } : {}) })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/submissions");
}
