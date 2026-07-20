import { createClient } from "@/lib/supabase/server";
import type { SiteSettings, SiteStat, IntentCard, HeroSlide } from "@/types";
import {
  DEFAULT_SETTINGS,
  DEFAULT_STATS,
  DEFAULT_FEATURES,
  DEFAULT_INTENT_CARDS,
  DEFAULT_HERO_SLIDES,
} from "@/lib/site-content/defaults";

// Every getter falls back to the in-code defaults if the tables don't exist
// yet or a query fails, so the public site always renders.

export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("site_settings").select("key, value");

  const merged: SiteSettings = { ...DEFAULT_SETTINGS };
  if (error || !data) return merged;

  const rows = data as unknown as { key: string; value: string | null }[];
  for (const row of rows) {
    if (row.value != null && row.value !== "") merged[row.key] = row.value;
  }
  return merged;
}

export async function getSiteStats(): Promise<SiteStat[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_stats")
    .select("label, value, suffix")
    .order("sort_order");

  const rows = (data ?? []) as unknown as { label: string; value: number; suffix: string | null }[];
  if (error || rows.length === 0) return DEFAULT_STATS;
  return rows.map((r) => ({ label: r.label, value: r.value, suffix: r.suffix ?? "" }));
}

export async function getSiteFeatures(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_features")
    .select("text")
    .order("sort_order");

  const rows = (data ?? []) as unknown as { text: string }[];
  if (error || rows.length === 0) return DEFAULT_FEATURES;
  return rows.map((r) => r.text);
}

// slides are hard-coded in defaults.ts
export function getHeroSlides(): HeroSlide[] {
  return DEFAULT_HERO_SLIDES;
}

export async function getIntentCards(): Promise<IntentCard[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("intent_cards")
    .select("title, subtitle, description, cta, href, image_url, accent")
    .order("sort_order");

  const rows = (data ?? []) as unknown as IntentCard[];
  if (error || rows.length === 0) return DEFAULT_INTENT_CARDS;
  return rows;
}
