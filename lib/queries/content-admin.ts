import { createClient } from "@/lib/supabase/server";
import type { SiteSettings } from "@/types";
import { DEFAULT_SETTINGS } from "@/lib/site-content/defaults";

export interface AdminStat { id: number; label: string; value: number; suffix: string; sort_order: number }
export interface AdminFeature { id: number; text: string; sort_order: number }
export interface AdminCity { id: number; name: string; slug: string; tagline: string | null; image_url: string | null }
export interface AdminIntentCard {
  id: number;
  title: string;
  subtitle: string | null;
  description: string | null;
  cta: string | null;
  href: string;
  image_url: string | null;
  accent: string;
}
export interface AdminContent {
  // false until the site-content migration has run
  ready: boolean;
  settings: SiteSettings;
  stats: AdminStat[];
  features: AdminFeature[];
  cities: AdminCity[];
  intentCards: AdminIntentCard[];
}

export async function getAdminContent(): Promise<AdminContent> {
  const supabase = await createClient();

  const [settingsRes, statsRes, featuresRes, citiesRes, cardsRes] = await Promise.all([
    supabase.from("site_settings").select("key, value"),
    supabase.from("site_stats").select("id, label, value, suffix, sort_order").order("sort_order"),
    supabase.from("site_features").select("id, text, sort_order").order("sort_order"),
    supabase.from("cities").select("id, name, slug, tagline, image_url").order("sort_order").order("name"),
    supabase
      .from("intent_cards")
      .select("id, title, subtitle, description, cta, href, image_url, accent")
      .order("sort_order"),
  ]);

  const ready = !settingsRes.error;

  const settings: SiteSettings = { ...DEFAULT_SETTINGS };
  const settingRows = (settingsRes.data ?? []) as unknown as { key: string; value: string | null }[];
  for (const row of settingRows) {
    if (row.value != null) settings[row.key] = row.value;
  }

  return {
    ready,
    settings,
    stats: (statsRes.data ?? []) as unknown as AdminStat[],
    features: (featuresRes.data ?? []) as unknown as AdminFeature[],
    cities: (citiesRes.data ?? []) as unknown as AdminCity[],
    intentCards: (cardsRes.data ?? []) as unknown as AdminIntentCard[],
  };
}
