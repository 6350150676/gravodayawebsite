import { z } from "zod";

export const propertySchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(200, "Title is too long"),
  description: z.string().min(10, "Description must be at least 10 characters").max(5000, "Description is too long"),

  price: z.number()
    .positive("Price must be a positive number")
    .max(999_999_999_999, "Price is too large — check the value"),

  price_label: z.string().max(50, "Price label is too long").optional(),

  category_id: z.number().int("Invalid category").positive("Category is required"),
  city_id: z.number().int("Invalid city").positive("City is required"),
  locality_id: z.number().int("Invalid locality").positive().optional(),

  address: z.string().max(300, "Address is too long").optional(),

  area_sqft: z.number()
    .positive("Area must be positive")
    .max(1_000_000, "Area value seems too large — check the value")
    .optional(),

  bedrooms: z.number().int("Bedrooms must be a whole number").min(0).max(20, "Bedrooms cannot exceed 20").optional(),
  bathrooms: z.number().int("Bathrooms must be a whole number").min(0).max(20, "Bathrooms cannot exceed 20").optional(),

  amenities: z.array(z.string()).default([]),
  is_for_rent: z.boolean().default(false),
  is_featured: z.boolean().default(false),
  status: z.enum(["active", "sold", "rented", "inactive"]).default("active"),

  map_lat: z.number().min(-90, "Latitude must be between -90 and 90").max(90, "Latitude must be between -90 and 90").optional(),
  map_lng: z.number().min(-180, "Longitude must be between -180 and 180").max(180, "Longitude must be between -180 and 180").optional(),
});

export type PropertyInput = z.infer<typeof propertySchema>;
