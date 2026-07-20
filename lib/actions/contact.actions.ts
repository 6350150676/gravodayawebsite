"use server";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyTeam } from "@/lib/notifications/notify-team";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  message: z.string().min(10, "Please write at least 10 characters").max(2000),
  honeypot: z.string().optional(),
});

export type ContactFormState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function createContactMessageAction(
  _prev: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name") ?? "",
    phone: formData.get("phone") ?? "",
    email: formData.get("email") ?? "",
    message: formData.get("message") ?? "",
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

  const { honeypot, name, phone, email, message } = parsed.data;
  if (honeypot) return { ok: true };

  const supabase = createAdminClient();
  const { error } = await supabase.from("contact_messages").insert({ name, phone, email: email || null, message });

  if (error) {
    console.error("[createContactMessageAction]", error.message);
    return { ok: false, error: "Something went wrong. Please try again or call us directly." };
  }

  await notifyTeam({ name, phone, email, message, subject: "Contact Form" });

  return { ok: true };
}
