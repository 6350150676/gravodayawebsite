import type { LucideIcon } from "lucide-react";
import {
  ArrowUpDown,
  Baby,
  BadgeCheck,
  Bath,
  Bed,
  Bike,
  Building2,
  Bus,
  Car,
  ChefHat,
  Clapperboard,
  Coffee,
  Compass,
  Dumbbell,
  Flower2,
  Footprints,
  Gamepad2,
  GraduationCap,
  Hospital,
  Landmark,
  Layers,
  Leaf,
  Lightbulb,
  MapPin,
  Plane,
  PartyPopper,
  Ruler,
  ShieldCheck,
  ShoppingBag,
  Sofa,
  Sparkles,
  Sun,
  Train,
  Trees,
  Users,
  Waves,
  Wifi,
  Wind,
  Wrench,
  Zap,
} from "lucide-react";

/**
 * The icons an admin can pick from, keyed by a stable string that is what we
 * actually store in the database. Adding an icon here makes it available in
 * every picker; renaming a key would orphan saved content, so don't.
 *
 * Kept deliberately small and real-estate specific — a 1000-icon picker is
 * unusable, and every one of these has an obvious use on a project page.
 */
export const PROJECT_ICONS = {
  sparkles: Sparkles,
  "map-pin": MapPin,
  building: Building2,
  layers: Layers,
  ruler: Ruler,
  bed: Bed,
  bath: Bath,
  sofa: Sofa,
  kitchen: ChefHat,
  shield: ShieldCheck,
  verified: BadgeCheck,
  pool: Waves,
  gym: Dumbbell,
  park: Trees,
  leaf: Leaf,
  flower: Flower2,
  jogging: Footprints,
  kids: Baby,
  games: Gamepad2,
  cinema: Clapperboard,
  party: PartyPopper,
  cafe: Coffee,
  lift: ArrowUpDown,
  parking: Car,
  power: Zap,
  lighting: Lightbulb,
  wifi: Wifi,
  ac: Wind,
  solar: Sun,
  maintenance: Wrench,
  community: Users,
  compass: Compass,
  temple: Landmark,
  school: GraduationCap,
  hospital: Hospital,
  shopping: ShoppingBag,
  bus: Bus,
  train: Train,
  airport: Plane,
  cycle: Bike,
} satisfies Record<string, LucideIcon>;

export type ProjectIconKey = keyof typeof PROJECT_ICONS;

/** Ordered list for the admin picker. */
export const PROJECT_ICON_KEYS = Object.keys(PROJECT_ICONS) as ProjectIconKey[];

// Word → icon, used when an admin leaves the icon blank. Ordered: the first
// pattern that matches wins, so put the specific ones first.
const GUESS_RULES: [RegExp, ProjectIconKey][] = [
  [/airport|flight/i, "airport"],
  [/railway|train|station/i, "train"],
  [/bus\b|bus stand|depot/i, "bus"],
  [/temple|ashram|ghat|mandir|har ki pauri/i, "temple"],
  [/school|college|university|campus/i, "school"],
  [/hospital|clinic|medical|health/i, "hospital"],
  [/mall|market|shopping|store|retail/i, "shopping"],
  [/pool|swim/i, "pool"],
  [/gym|fitness|yoga/i, "gym"],
  [/kids|children|play/i, "kids"],
  [/garden|lawn|landscap|green|plantation|park\b/i, "park"],
  [/jog|walk|track|trail|reflexolog/i, "jogging"],
  [/theatre|theater|cinema|screening/i, "cinema"],
  [/club|banquet|party|celebration/i, "party"],
  [/cafe|coffee|restaurant|dining/i, "cafe"],
  [/indoor game|table tennis|billiard|snooker|carrom/i, "games"],
  [/security|cctv|guard|surveillance|gated|fire/i, "shield"],
  [/lift|elevator|staircase/i, "lift"],
  [/parking|basement|ev charg/i, "parking"],
  [/power|electric|backup|generator|dg\b/i, "power"],
  [/light/i, "lighting"],
  [/wifi|internet|broadband|smart home|automation/i, "wifi"],
  [/air.?condition|\bac\b|hvac|ventilat/i, "ac"],
  [/solar|energy/i, "solar"],
  [/maintenance|service|housekeep/i, "maintenance"],
  [/community|clubhouse|society|resident/i, "community"],
  [/bedroom|\bbhk\b|\bbed\b/i, "bed"],
  [/bath|toilet|washroom|shower/i, "bath"],
  [/kitchen|modular/i, "kitchen"],
  [/living|lounge|drawing|interior|furnish/i, "sofa"],
  [/area|sq\.?\s?ft|carpet|size|dimension/i, "ruler"],
  [/tower|block|floor|storey|structure/i, "layers"],
  [/rera|approved|verified|legal|clear title/i, "verified"],
  [/location|connect|highway|road|km\b|min/i, "map-pin"],
  [/vastu|facing|direction/i, "compass"],
  [/eco|environment|natural|air quality/i, "leaf"],
];

/** Resolve a stored icon key, falling back to a guess from the label. */
export function projectIcon(key: string | null | undefined, label = ""): LucideIcon {
  if (key && key in PROJECT_ICONS) return PROJECT_ICONS[key as ProjectIconKey];
  for (const [pattern, guess] of GUESS_RULES) {
    if (pattern.test(label)) return PROJECT_ICONS[guess];
  }
  return Sparkles;
}
