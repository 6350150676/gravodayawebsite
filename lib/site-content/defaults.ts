// Fallback content used until the site_content migration runs; DB values
// set by the admin override these.
import type { SiteSettings, SiteStat, IntentCard, HeroSlide } from "@/types";

export const DEFAULT_SETTINGS: SiteSettings = {
  phone_display: "+91 93684 46069",
  phone_tel: "+919368446069",
  whatsapp_number: "919368446069",
  contact_email: "garvodaydevelopers@gmail.com",
  contact_address: "KH No. 2293, Suman Nagar Road, Salempur Mahdood-2, Haridwar, Uttarakhand 249402",
  hero_badge: "Uttarakhand's Most Trusted Real Estate",
  hero_title: "Find Your Dream Home in the Himalayas",
  hero_subtitle:
    "Villas, plots & residential properties across Haridwar",
  hero_image_url:
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1800&q=85&auto=format&fit=crop",
  whyus_image_url:
    "https://images.unsplash.com/photo-1750301668797-f21fa5973d62?w=900&q=80&auto=format&fit=crop",
  company_tagline: "Garvoday Realty · Haridwar",
};

export const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    badge: "by Garvoday Developers Pvt. Ltd.",
    title: "Garvoday Realty",
    subtitle: "Villas, plots & residential properties across Haridwar.\nHonest pricing and hands-on guidance, from search to registration.",
    image_url: DEFAULT_SETTINGS.hero_image_url,
  },
  {
    badge: "Our Vision",
    title: "Building Communities, Not Just Colonies",
    subtitle: "We aim to make quality real estate accessible and transparent for every family in Uttarakhand.",
    image_url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1800&q=85&auto=format&fit=crop",
  },
  {
    badge: "About Us",
    title: "Haridwar's Real Estate Developer",
    subtitle: "RERA registered, family-owned, and committed to honest pricing with no hidden charges.",
    image_url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1800&q=85&auto=format&fit=crop",
  },
  {
    badge: "Zero Brokerage",
    title: "No Brokerage, No Hidden Fees",
    subtitle: "Deal directly with the developer — what you see is what you pay, with nothing extra added on.",
    image_url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1800&q=85&auto=format&fit=crop",
  },
];

export const DEFAULT_STATS: SiteStat[] = [
  { label: "Prime Location", value: 1, suffix: "" },
  { label: "Transparency", value: 100, suffix: "%" },
];

export const DEFAULT_FEATURES: string[] = [
  "RERA registered & legally compliant properties",
  "Dedicated relationship manager for every buyer",
  "Transparent pricing — no hidden charges",
  "Expert knowledge of the Haridwar real estate market",
  "End-to-end support from search to registration",
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
