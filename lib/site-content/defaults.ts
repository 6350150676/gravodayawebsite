/**
 * Default site content. These mirror the values that used to be hard-coded on
 * the landing page. They are used as a fallback so the public site renders
 * identically *before* the `20240002000000_site_content.sql` migration is run,
 * and merged under any values the admin later sets in the database.
 */
import type { SiteSettings, SiteStat, IntentCard } from "@/types";

export const DEFAULT_SETTINGS: SiteSettings = {
  phone_display: "+91 98765 43210",
  phone_tel: "+919876543210",
  whatsapp_number: "919876543210",
  contact_email: "info@garvoday.com",
  contact_address: "Kankhal, Haridwar, Uttarakhand",
  hero_badge: "Uttarakhand's Most Trusted Real Estate",
  hero_title: "Find Your Dream Home in the Himalayas",
  hero_subtitle:
    "Apartments, villas, plots & commercial spaces across Haridwar",
  hero_image_url:
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1800&q=85&auto=format&fit=crop",
  whyus_image_url:
    "https://images.unsplash.com/photo-1750301668797-f21fa5973d62?w=900&q=80&auto=format&fit=crop",
  company_tagline: "Trusted Since 2008 · Haridwar",
  rating_value: "5.0",
  rating_count: "120+",
};

export const DEFAULT_STATS: SiteStat[] = [
  { label: "Years of Experience", value: 15, suffix: "+" },
  { label: "Happy Families", value: 500, suffix: "+" },
  { label: "Prime Location", value: 1, suffix: "" },
  { label: "Transparency", value: 100, suffix: "%" },
];

export const DEFAULT_FEATURES: string[] = [
  "RERA registered & legally compliant properties",
  "Dedicated relationship manager for every buyer",
  "Transparent pricing — no hidden charges",
  "Expert knowledge of the Haridwar real estate market",
  "End-to-end support from search to registration",
  "Trusted by 500+ families across Uttarakhand",
];

export const DEFAULT_INTENT_CARDS: IntentCard[] = [
  {
    title: "Buy a Home",
    subtitle: "Own your dream property",
    description:
      "Browse apartments, villas, plots & more for sale across Haridwar.",
    cta: "Explore for Sale →",
    href: "/properties",
    image_url:
      "https://images.unsplash.com/photo-1642667670006-6b3059ccf96d?w=800&q=80&auto=format&fit=crop",
    accent: "var(--color-brand)",
  },
  {
    title: "Rent a Property",
    subtitle: "Comfortable living spaces",
    description:
      "Find fully furnished or semi-furnished homes & offices at fair monthly rentals.",
    cta: "Browse Rentals →",
    href: "/properties?type=rent",
    image_url:
      "https://images.unsplash.com/photo-1688653802629-5360086bf632?w=800&q=80&auto=format&fit=crop",
    accent: "var(--color-gold)",
  },
  {
    title: "Sell Your Property",
    subtitle: "Get the best value",
    description:
      "List with us and reach thousands of qualified buyers. Free valuation & expert assistance.",
    cta: "Get Free Valuation →",
    href: "/contact",
    image_url:
      "https://images.unsplash.com/photo-1613977257365-aaae5a9817ff?w=800&q=80&auto=format&fit=crop",
    accent: "var(--color-moss)",
  },
];
