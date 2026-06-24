import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  email: z.string().email().optional().or(z.literal("")),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000),
  honeypot: z.string().max(0, "Bot detected"),
});

export type ContactInput = z.infer<typeof contactSchema>;
