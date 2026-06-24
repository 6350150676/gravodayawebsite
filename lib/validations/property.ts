import { z } from "zod";

export const propertySchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(20).max(5000),
  price: z.number().positive("Price must be positive"),
  price_label: z.string().max(50).optional(),
  category_id: z.number().int().positive(),
  city_id: z.number().int().positive(),
  locality_id: z.number().int().positive().optional(),
  address: z.string().max(300).optional(),
  area_sqft: z.number().positive().optional(),
  bedrooms: z.number().int().min(0).max(20).optional(),
  bathrooms: z.number().int().min(0).max(20).optional(),
  amenities: z.array(z.string()).default([]),
  is_for_rent: z.boolean().default(false),
  is_featured: z.boolean().default(false),
  status: z.enum(["active", "sold", "rented", "inactive"]).default("active"),
  map_lat: z.number().optional(),
  map_lng: z.number().optional(),
});

export type PropertyInput = z.infer<typeof propertySchema>;
