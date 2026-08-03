import { z } from "zod";

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
  payment_plan: z.string().max(8000, "Payment plan is too long").optional(),
  brochure_url: z.string().url("Must be a valid URL").max(500).optional().or(z.literal("")),

  is_featured: z.boolean().default(false),
  status: z.enum(["active", "inactive"]).default("active"),
}).refine(
  (d) => d.price_min === undefined || d.price_max === undefined || d.price_max >= d.price_min,
  { message: "Top-end price cannot be lower than the starting price", path: ["price_max"] },
);

export type ProjectInput = z.infer<typeof projectSchema>;
