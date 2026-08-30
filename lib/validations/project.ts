import { z } from "zod";

// Free-text cell inside a structured section. Trimmed, capped, and allowed to
// be empty — an admin filling in three of seven payment columns is normal.
const cell = (max = 200) => z.string().trim().max(max).default("");

const highlightSchema = z.object({
  icon: cell(40),
  title: z.string().trim().min(1, "Highlight title is required").max(80),
  description: cell(300),
});

const amenityGroupSchema = z.object({
  icon: cell(40),
  title: z.string().trim().min(1, "Amenity category needs a title").max(80),
  items: z.array(z.string().trim().min(1).max(160)).max(60, "Too many amenities in one category"),
});

const locationAdvantageSchema = z.object({
  icon: cell(40),
  place: z.string().trim().min(1, "Location needs a name").max(120),
  distance: cell(60),
});

const paymentRowSchema = z.object({
  unit_type: z.string().trim().min(1, "Payment row needs a unit type").max(80),
  tower: cell(80),
  area: cell(80),
  price: cell(80),
  availability: cell(60),
  charges: cell(120),
  notes: cell(300),
});

const chargeSchema = z.object({
  label: z.string().trim().min(1, "Charge needs a label").max(120),
  value: cell(80),
  note: cell(200),
});

const specSchema = z.object({
  label: z.string().trim().min(1, "Spec needs a label").max(80),
  value: z.string().trim().min(1, "Spec needs a value").max(120),
});

export const projectSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(200, "Name is too long"),
  tagline: z.string().max(150, "Tagline is too long").optional(),
  location: z.string().max(200, "Location is too long").optional(),
  city_id: z.number().int("Invalid city").positive().optional(),

  price_min: z.number().positive("Starting price must be greater than 0").optional(),
  price_max: z.number().positive("Top-end price must be greater than 0").optional(),

  // Which type filters this project should turn up under. A project can sell
  // more than one type (plots and villas), so this is a set, not one choice.
  category_ids: z.array(z.number().int().positive()).default([]),

  description: z.string().min(10, "Description must be at least 10 characters").max(8000, "Description is too long"),
  overview: z.string().max(600, "Overview is too long").optional(),
  payment_plan: z.string().max(8000, "Payment plan is too long").optional(),
  payment_note: z.string().max(1000, "Payment note is too long").optional(),
  brochure_url: z.string().url("Must be a valid URL").max(500).optional().or(z.literal("")),
  rera_number: z.string().max(120, "RERA number is too long").optional(),

  // Per-project CTA overrides; blank falls back to the site-wide numbers.
  contact_phone: z
    .string()
    .max(20)
    .regex(/^\+?[0-9 -]{6,20}$/, "Enter a phone number like +919876543210")
    .optional()
    .or(z.literal("")),
  contact_whatsapp: z
    .string()
    .max(20)
    .regex(/^[0-9]{10,15}$/, "WhatsApp number must be digits with country code, e.g. 919876543210")
    .optional()
    .or(z.literal("")),

  // Structured detail-page sections. Every one is optional and unbounded in
  // shape-count on purpose: the page lays out however many entries exist, and
  // an empty array simply hides that section.
  highlights: z.array(highlightSchema).max(24, "Too many highlights").default([]),
  amenity_groups: z.array(amenityGroupSchema).max(12, "Too many amenity categories").default([]),
  location_advantages: z.array(locationAdvantageSchema).max(30, "Too many location advantages").default([]),
  payment_plans: z.array(paymentRowSchema).max(40, "Too many payment rows").default([]),
  additional_charges: z.array(chargeSchema).max(20, "Too many additional charges").default([]),
  key_specs: z.array(specSchema).max(16, "Too many key specs").default([]),

  is_featured: z.boolean().default(false),
  status: z.enum(["active", "inactive"]).default("active"),
}).refine(
  (d) => d.price_min === undefined || d.price_max === undefined || d.price_max >= d.price_min,
  { message: "Top-end price cannot be lower than the starting price", path: ["price_max"] },
);

export type ProjectInput = z.infer<typeof projectSchema>;
