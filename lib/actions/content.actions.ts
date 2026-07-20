"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const SETTING_KEYS = [
  "phone_display",
  "phone_tel",
  "whatsapp_number",
  "contact_email",
  "contact_address",
  "hero_badge",
  "hero_title",
  "hero_subtitle",
  "hero_image_url",
  "whyus_image_url",
  "company_tagline",
] as const;

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
}

function revalidatePublic() {
  revalidatePath("/", "layout");
  revalidatePath("/properties");
  revalidatePath("/admin/content");
}

export async function updateSettingsAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  // only write keys the submitted form actually contains, so saving one
  // section doesn't blank another
  const rows = SETTING_KEYS.filter((key) => formData.has(key)).map((key) => ({
    key,
    value: (formData.get(key) as string | null)?.trim() ?? "",
  }));
  if (rows.length === 0) return;

  const { error } = await supabase.from("site_settings").upsert(rows, { onConflict: "key" });
  if (error) throw new Error(error.message);

  revalidatePublic();
}

export async function updateStatsAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const ids = formData.getAll("stat_id") as string[];
  const labels = formData.getAll("stat_label") as string[];
  const values = formData.getAll("stat_value") as string[];
  const suffixes = formData.getAll("stat_suffix") as string[];

  for (let i = 0; i < ids.length; i++) {
    const value = Number(values[i]);
    const { error } = await supabase
      .from("site_stats")
      .update({
        label: labels[i]?.trim() ?? "",
        value: Number.isFinite(value) ? Math.trunc(value) : 0,
        suffix: suffixes[i]?.trim() ?? "",
      })
      .eq("id", Number(ids[i]));
    if (error) throw new Error(error.message);
  }

  revalidatePublic();
}

export async function updateFeaturesAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const lines = (formData.get("features") as string | null ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  // wipe and re-insert to handle reordering and deletions in one go
  const del = await supabase.from("site_features").delete().neq("id", 0);
  if (del.error) throw new Error(del.error.message);

  if (lines.length > 0) {
    const { error } = await supabase
      .from("site_features")
      .insert(lines.map((text, i) => ({ text, sort_order: i + 1 })));
    if (error) throw new Error(error.message);
  }

  revalidatePublic();
}

export async function updateCitiesMetaAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const ids = formData.getAll("city_id") as string[];
  const taglines = formData.getAll("city_tagline") as string[];
  const images = formData.getAll("city_image") as string[];

  for (let i = 0; i < ids.length; i++) {
    const { error } = await supabase
      .from("cities")
      .update({
        tagline: taglines[i]?.trim() || null,
        image_url: images[i]?.trim() || null,
      })
      .eq("id", Number(ids[i]));
    if (error) throw new Error(error.message);
  }

  revalidatePublic();
}

export async function updateIntentCardsAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const ids = formData.getAll("card_id") as string[];
  const titles = formData.getAll("card_title") as string[];
  const subtitles = formData.getAll("card_subtitle") as string[];
  const descriptions = formData.getAll("card_description") as string[];
  const ctas = formData.getAll("card_cta") as string[];
  const hrefs = formData.getAll("card_href") as string[];
  const images = formData.getAll("card_image") as string[];
  const accents = formData.getAll("card_accent") as string[];

  for (let i = 0; i < ids.length; i++) {
    const { error } = await supabase
      .from("intent_cards")
      .update({
        title: titles[i]?.trim() ?? "",
        subtitle: subtitles[i]?.trim() || null,
        description: descriptions[i]?.trim() || null,
        cta: ctas[i]?.trim() || null,
        href: hrefs[i]?.trim() || "/properties",
        image_url: images[i]?.trim() || null,
        accent: accents[i]?.trim() || "var(--color-brand)",
      })
      .eq("id", Number(ids[i]));
    if (error) throw new Error(error.message);
  }

  revalidatePublic();
}
