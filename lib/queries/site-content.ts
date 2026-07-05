import { createClient } from "@/lib/supabase/server";
import type { SiteSettings, SiteStat, IntentCard } from "@/types";
import {
  DEFAULT_SETTINGS,
  DEFAULT_STATS,
  DEFAULT_FEATURES,
  DEFAULT_INTENT_CARDS,
} from "@/lib/site-content/defaults";

/**
 * Editable site content. Every getter is defensive: if the content tables do
 * not exist yet (migration not run) or a query fails, it falls back to the
 * in-code defaults so the public site keeps rendering. DB values always win.
 */

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
