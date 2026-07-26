import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import type { SiteSettings, SiteStat, IntentCard, HeroSlide } from "@/types";
import {
  DEFAULT_SETTINGS,
  DEFAULT_STATS,
  DEFAULT_FEATURES,
  DEFAULT_INTENT_CARDS,
  DEFAULT_HERO_SLIDES,
} from "@/lib/site-content/defaults";

// Site content is read by the shared public layout on every single request but
// is edited a few times a year — cache it and let the admin actions bust the
// tag, instead of re-querying four tables per page view.
export const SITE_CONTENT_TAG = "site-content";
const CONTENT_CACHE = { revalidate: 3600, tags: [SITE_CONTENT_TAG] };

// Every getter falls back to the in-code defaults if the tables don't exist
// yet or a query fails, so the public site always renders.

export const getSiteSettings = unstable_cache(
  async (): Promise<SiteSettings> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase.from("site_settings").select("key, value");

    const merged: SiteSettings = { ...DEFAULT_SETTINGS };
    if (error || !data) return merged;

    const rows = data as unknown as { key: string; value: string | null }[];
    for (const row of rows) {
      if (row.value != null && row.value !== "") merged[row.key] = row.value;
    }
    return merged;
  },
  ["site-settings"],
  CONTENT_CACHE,
);

export const getSiteStats = unstable_cache(
  async (): Promise<SiteStat[]> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("site_stats")
      .select("label, value, suffix")
      .order("sort_order");

    const rows = (data ?? []) as unknown as { label: string; value: number; suffix: string | null }[];
    if (error || rows.length === 0) return DEFAULT_STATS;
    return rows.map((r) => ({ label: r.label, value: r.value, suffix: r.suffix ?? "" }));
  },
  ["site-stats"],
  CONTENT_CACHE,
);

export const getSiteFeatures = unstable_cache(
  async (): Promise<string[]> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("site_features")
      .select("text")
      .order("sort_order");

    const rows = (data ?? []) as unknown as { text: string }[];
    if (error || rows.length === 0) return DEFAULT_FEATURES;
    return rows.map((r) => r.text);
  },
  ["site-features"],
  CONTENT_CACHE,
);

// slides are hard-coded in defaults.ts
export function getHeroSlides(): HeroSlide[] {
  return DEFAULT_HERO_SLIDES;
}

export const getIntentCards = unstable_cache(
  async (): Promise<IntentCard[]> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("intent_cards")
      .select("title, subtitle, description, cta, href, image_url, accent")
      .order("sort_order");

    const rows = (data ?? []) as unknown as IntentCard[];
    if (error || rows.length === 0) return DEFAULT_INTENT_CARDS;
    return rows;
  },
  ["intent-cards"],
  CONTENT_CACHE,
);
