"use server";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

const feedbackSchema = z.object({
  source: z.enum(["contact", "inquiry", "submission"]),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export type FeedbackFormState = {
  ok: boolean;
  error?: string;
};

export async function createFeedbackAction(
  _prev: FeedbackFormState,
  formData: FormData,
): Promise<FeedbackFormState> {
  const parsed = feedbackSchema.safeParse({
    source: formData.get("source") ?? "",
    rating: formData.get("rating") ?? "",
    comment: formData.get("comment") ?? "",
  });

  if (!parsed.success) {
    return { ok: false, error: "Please select a rating." };
  }

  const { source, rating, comment } = parsed.data;

  const supabase = createAdminClient();
  const { error } = await supabase.from("feedback").insert({
    source,
    rating,
    comment: comment?.trim() || null,
  });

  if (error) {
    console.error("[createFeedbackAction]", error.message);
    return { ok: false, error: "Something went wrong. Please try again." };
  }

  return { ok: true };
}
