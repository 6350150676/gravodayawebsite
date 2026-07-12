import { z } from "zod";

export const projectSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(200, "Name is too long"),
  tagline: z.string().max(150, "Tagline is too long").optional(),
  location: z.string().max(200, "Location is too long").optional(),
  city_id: z.number().int("Invalid city").positive().optional(),

  description: z.string().min(10, "Description must be at least 10 characters").max(8000, "Description is too long"),
  payment_plan: z.string().max(8000, "Payment plan is too long").optional(),
  brochure_url: z.string().url("Must be a valid URL").max(500).optional().or(z.literal("")),

  is_featured: z.boolean().default(false),
  status: z.enum(["active", "inactive"]).default("active"),
});

export type ProjectInput = z.infer<typeof projectSchema>;
