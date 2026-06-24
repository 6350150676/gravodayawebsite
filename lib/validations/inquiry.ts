import { z } from "zod";

export const inquirySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  message: z.string().max(1000).optional(),
  property_id: z.string().uuid().optional(),
  honeypot: z.string().max(0, "Bot detected"),
});

export type InquiryInput = z.infer<typeof inquirySchema>;
