import { sendInquiryNotification } from "@/lib/email/inquiry-notification";
import { sendInquiryWhatsAppNotification } from "@/lib/whatsapp/inquiry-notification";
import { getSiteSettings } from "@/lib/queries/site-content";

export interface TeamNotificationData {
  name: string;
  phone: string;
  email?: string | null;
  message?: string | null;
  /** Short label for the WhatsApp template, e.g. property title or "Contact Form". */
  subject: string;
  propertyTitle?: string | null;
  propertyUrl?: string | null;
}

/**
 * Fans out a new-lead notification to every team channel (email + WhatsApp).
 * Best-effort: failures are logged, never thrown, so callers can't fail a
 * form submission over a notification.
 */
export async function notifyTeam(data: TeamNotificationData): Promise<void> {
  try {
    // WhatsApp doesn't need site settings, so it starts alongside the fetch.
    await Promise.all([
      getSiteSettings().then((settings) =>
        sendInquiryNotification({
          name: data.name,
          phone: data.phone,
          email: data.email || null,
          message: data.message || null,
          propertyTitle: data.propertyTitle ?? null,
          propertyUrl: data.propertyUrl ?? null,
          toEmail: settings.contact_email,
        }),
      ).catch((err) => console.error("[notifyTeam] email failed:", err)),
      sendInquiryWhatsAppNotification({
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        message: data.message || null,
        subject: data.subject,
      }).catch((err) => console.error("[notifyTeam] whatsapp failed:", err)),
    ]);
  } catch (err) {
    console.error("[notifyTeam]", err);
  }
}
