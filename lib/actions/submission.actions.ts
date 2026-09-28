"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/require-admin";
import { notifyTeam } from "@/lib/notifications/notify-team";
import { sellRatelimit } from "@/lib/ratelimit";
import { toListingWebp, UnsupportedImageError } from "@/lib/images/listing-image";
import { MAX_PHOTO_BYTES, MAX_SUBMISSION_PHOTOS, isListingImageType } from "@/lib/images/limits";
import {
  SUBMISSION_IMAGES_BUCKET,
  appendPropertyImages,
  revalidatePublicProperties,
  uniquePropertySlug,
} from "@/lib/properties/listing";
import { propertySchema } from "@/lib/validations/property";

// "" → undefined, "1,200" → 1200, "abc" → NaN (rejected by z.number)
function optionalNumber(message: string) {
  return z.preprocess((v) => {
    const s = String(v ?? "").replace(/,/g, "").trim();
    return s === "" ? undefined : Number(s);
  }, z.number({ invalid_type_error: message }).optional());
}

const roomCount = optionalNumber("Enter a number").refine(
  (v) => v === undefined || (Number.isInteger(v) && v >= 0 && v <= 20),
  "Enter a whole number from 0 to 20",
);

const submissionSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  property_type: z.string().min(1, "Please select a property type"),
  city: z.string().min(1, "Please select a city"),
  locality: z.string().max(100).optional(),
  description: z.string().min(10, "Please describe your property (min 10 characters)").max(2000),
  asking_price: z.string().optional(),
  area_sqft: optionalNumber("Enter the area as a number").refine(
    (v) => v === undefined || (v > 0 && v <= 1_000_000),
    "Enter the area in sq.ft",
  ),
  bedrooms: roomCount,
  bathrooms: roomCount,
  honeypot: z.string().optional(),
});

export type SubmissionFormState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

function photoError(message: string): SubmissionFormState {
  return { ok: false, error: "Please check your photos.", fieldErrors: { images: message } };
}

// Best effort, like the chat search: the form still works if Upstash is down.
async function isRateLimited(): Promise<boolean> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip");
  // Without an IP every visitor would share one bucket, so don't limit at all.
  if (!ip) return false;
  try {
    const { success } = await sellRatelimit.limit(ip);
    return !success;
  } catch {
    return false;
  }
}

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
    area_sqft: formData.get("area_sqft") ?? "",
    bedrooms: formData.get("bedrooms") ?? "",
    bathrooms: formData.get("bathrooms") ?? "",
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

  const {
    honeypot, name, phone, email, property_type, city, locality, description, asking_price,
    area_sqft, bedrooms, bathrooms,
  } = parsed.data;
  if (honeypot) return { ok: true };

  // The form checks all of this before uploading; this is for anything that
  // didn't come through the form.
  const photos = formData
    .getAll("images")
    .filter((f): f is File => f instanceof File && f.size > 0);
  if (photos.length > MAX_SUBMISSION_PHOTOS) {
    return photoError(`You can upload up to ${MAX_SUBMISSION_PHOTOS} photos.`);
  }
  for (const photo of photos) {
    if (!isListingImageType(photo)) return photoError(`${photo.name} isn't a JPG, PNG or WebP image.`);
    if (photo.size > MAX_PHOTO_BYTES) return photoError(`${photo.name} is larger than 10 MB.`);
  }

  if (await isRateLimited()) {
    return {
      ok: false,
      error: "You've sent several listings in the last hour. Please try again later or call us directly.",
    };
  }

  // Encode every photo before writing anything, so an unreadable file can't
  // leave a half-saved submission behind. One at a time, to bound memory.
  const webps: Buffer[] = [];
  try {
    for (const photo of photos) webps.push(await toListingWebp(photo));
  } catch (err) {
    if (err instanceof UnsupportedImageError) {
      return photoError(`${err.message}. Please remove it and try again.`);
    }
    console.error("[createSubmissionAction] encode", err);
    return photoError("We couldn't process your photos. Please try again.");
  }

  const priceNum = asking_price ? parseFloat(asking_price.replace(/,/g, "")) : null;

  const supabase = createAdminClient();
  const { data: submission, error } = await supabase
    .from("seller_submissions")
    .insert({
      name,
      phone,
      email: email || null,
      property_type,
      city,
      locality: locality || null,
      description,
      asking_price: priceNum && !isNaN(priceNum) ? priceNum : null,
      area_sqft: area_sqft ?? null,
      bedrooms: bedrooms ?? null,
      bathrooms: bathrooms ?? null,
    })
    .select("id")
    .single();

  if (error || !submission) {
    console.error("[createSubmissionAction]", error?.message);
    return { ok: false, error: "Something went wrong. Please try again or call us directly." };
  }

  // Private bucket: nobody outside the admin panel sees these until approval.
  if (webps.length) {
    const paths = webps.map(() => `${submission.id}/${crypto.randomUUID()}.webp`);
    const uploads = await Promise.all(
      webps.map((webp, i) =>
        supabase.storage
          .from(SUBMISSION_IMAGES_BUCKET)
          .upload(paths[i], webp, { contentType: "image/webp", upsert: false }),
      ),
    );
    const uploadError = uploads.find((u) => u.error)?.error;

    const { error: rowsError } = uploadError
      ? { error: null }
      : await supabase.from("submission_images").insert(
          paths.map((storage_path, sort_order) => ({
            submission_id: submission.id,
            storage_path,
            sort_order,
          })),
        );

    if (uploadError || rowsError) {
      console.error("[createSubmissionAction] photos", uploadError?.message ?? rowsError?.message);
      // Roll back so the seller can simply resubmit.
      await supabase.storage.from(SUBMISSION_IMAGES_BUCKET).remove(paths);
      await supabase.from("seller_submissions").delete().eq("id", submission.id);
      return photoError("We couldn't upload your photos. Please try again.");
    }
  }

  const details = [
    area_sqft && `${area_sqft.toLocaleString("en-IN")} sq.ft`,
    bedrooms != null && `${bedrooms} bed`,
    bathrooms != null && `${bathrooms} bath`,
  ].filter(Boolean).join(" · ");
  const summary = `Property Type: ${property_type}\nCity: ${city}${locality ? `, ${locality}` : ""}\nAsking Price: ${asking_price || "Not specified"}${details ? `\nDetails: ${details}` : ""}\nPhotos: ${webps.length}\n\n${description}`;
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

// ── Admin review ─────────────────────────────────────────────────────

export type ReviewResult = { ok: true; warning?: string } | { ok: false; error: string };

function toNum(value: FormDataEntryValue | null): number | undefined {
  if (!value || value === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function text(value: FormDataEntryValue | null): string | undefined {
  const s = String(value ?? "").trim();
  return s || undefined;
}

function revalidateReview() {
  revalidatePath("/admin/submissions");
  revalidatePath("/admin/properties");
  revalidatePath("/admin");
}

// Approving publishes the submission as an ordinary listing in `properties`,
// built from the fields the admin reviewed in the approve dialog, with the
// seller's photos copied into the public bucket. Everything after that (the
// amenities, selling points, photo order) is edited in the existing property
// editor, like any other listing.
export async function approveSubmissionAction(id: string, formData: FormData): Promise<ReviewResult> {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data: raw } = await supabase
    .from("seller_submissions")
    .select("id, property_id, images:submission_images(storage_path, sort_order)")
    .eq("id", id)
    .maybeSingle();
  const submission = raw as unknown as
    | { id: string; property_id: string | null; images: { storage_path: string; sort_order: number }[] }
    | null;

  if (!submission) return { ok: false, error: "This submission no longer exists." };
  if (submission.property_id) return { ok: false, error: "This submission is already published." };

  const parsed = propertySchema.safeParse({
    title: text(formData.get("title")),
    description: text(formData.get("description")),
    price: toNum(formData.get("price")),
    price_label: text(formData.get("price_label")),
    category_id: toNum(formData.get("category_id")),
    city_id: toNum(formData.get("city_id")),
    locality_id: toNum(formData.get("locality_id")),
    address: text(formData.get("address")),
    area_sqft: toNum(formData.get("area_sqft")),
    bedrooms: toNum(formData.get("bedrooms")),
    bathrooms: toNum(formData.get("bathrooms")),
    // held back until the photos are in, so it never goes live half-built
    status: "inactive",
  });
  if (!parsed.success) {
    const issue = parsed.error.errors[0];
    const field = issue.path.length ? `${String(issue.path[0]).replace(/_/g, " ")}: ` : "";
    return { ok: false, error: `${field}${issue.message}` };
  }

  const slug = await uniquePropertySlug(parsed.data.title);
  const { data: property, error: insertError } = await supabase
    .from("properties")
    .insert({ ...parsed.data, slug })
    .select("id")
    .single();
  if (insertError || !property) {
    return { ok: false, error: insertError?.message ?? "Couldn't create the listing." };
  }

  // Claim the submission. The property_id guard means a double click, or two
  // admins at once, publishes it exactly once.
  const { data: claimed, error: claimError } = await supabase
    .from("seller_submissions")
    .update({
      status: "approved",
      approved_at: new Date().toISOString(),
      property_id: property.id,
      // it may have been rejected before being reconsidered
      rejection_reason: null,
      rejected_at: null,
    })
    .eq("id", id)
    .is("property_id", null)
    .select("id");
  if (claimError || !claimed?.length) {
    await supabase.from("properties").delete().eq("id", property.id);
    return { ok: false, error: claimError?.message ?? "Someone else has just reviewed this submission." };
  }

  const images = [...submission.images].sort((a, b) => a.sort_order - b.sort_order);
  const webps: Buffer[] = [];
  for (const img of images) {
    const { data: blob, error } = await supabase.storage.from(SUBMISSION_IMAGES_BUCKET).download(img.storage_path);
    if (error || !blob) {
      console.error("[approveSubmissionAction] download", img.storage_path, error?.message);
      continue;
    }
    webps.push(Buffer.from(await blob.arrayBuffer()));
  }
  const copied = await appendPropertyImages(property.id, webps);

  const { error: publishError } = await supabase
    .from("properties")
    .update({ status: "active" })
    .eq("id", property.id);

  revalidateReview();
  revalidatePublicProperties();

  if (publishError) {
    return {
      ok: true,
      warning: `Approved, but the listing couldn't be switched live (${publishError.message}). Set its status to Active in the listing editor.`,
    };
  }
  if (copied < images.length) {
    const missing = images.length - copied;
    return {
      ok: true,
      warning: `Approved, but ${missing} photo${missing === 1 ? "" : "s"} couldn't be copied. Add ${missing === 1 ? "it" : "them"} from the listing editor.`,
    };
  }
  return { ok: true };
}

export async function rejectSubmissionAction(id: string, reason: string): Promise<ReviewResult> {
  await requireAdmin();

  const trimmed = reason.trim();
  if (trimmed.length > 1000) return { ok: false, error: "Keep the reason under 1000 characters." };

  const supabase = createAdminClient();
  // A published submission can't be rejected from here: its listing may have
  // been edited since, and quietly hiding it would be a surprise.
  const { data, error } = await supabase
    .from("seller_submissions")
    .update({ status: "rejected", rejected_at: new Date().toISOString(), rejection_reason: trimmed || null })
    .eq("id", id)
    .is("property_id", null)
    .select("id");

  if (error) return { ok: false, error: error.message };
  if (!data?.length) {
    return {
      ok: false,
      error: "This submission is already published. To take it down, set the listing to Inactive or delete it under Properties.",
    };
  }

  revalidateReview();
  return { ok: true };
}

export async function updateSubmissionNotesAction(id: string, notes: string) {
  await requireAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("seller_submissions")
    .update({ admin_notes: notes.trim() || null })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/submissions");
}
