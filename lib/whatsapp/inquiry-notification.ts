const GRAPH_API_VERSION = "v21.0";

export interface InquiryWhatsAppData {
  name: string;
  phone: string;
  email?: string | null;
  message?: string | null;
  subject: string; // e.g. property title or "General Inquiry"
}

/**
 * Meta rejects template parameters containing newlines, tabs, or 4+
 * consecutive spaces, so flatten free-text fields before sending.
 */
function sanitizeParam(value: string, maxLength = 500): string {
  const flat = value.replace(/\s+/g, " ").trim();
  return flat.length > maxLength ? `${flat.slice(0, maxLength - 1)}…` : flat;
}

/**
 * Sends a "new inquiry" WhatsApp template message to every number in
 * WHATSAPP_TEAM_NUMBERS via the Meta WhatsApp Cloud API. No-ops when the
 * env vars aren't configured, and never throws — callers treat this as
 * best-effort, same as the email notification.
 */
export async function sendInquiryWhatsAppNotification(data: InquiryWhatsAppData) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const teamNumbers = (process.env.WHATSAPP_TEAM_NUMBERS ?? "")
    .split(",")
    .map((n) => n.replace(/\D/g, ""))
    .filter(Boolean);

  if (!token || !phoneNumberId || teamNumbers.length === 0) return;

  const templateName = process.env.WHATSAPP_TEMPLATE_NAME ?? "new_inquiry";
  const templateLang = process.env.WHATSAPP_TEMPLATE_LANG ?? "en";

  const bodyParams = [
    sanitizeParam(data.name, 100),
    sanitizeParam(data.phone, 20),
    sanitizeParam(data.subject, 200),
    sanitizeParam(
      [data.email, data.message].filter(Boolean).join(" — ") || "No message",
    ),
  ].map((text) => ({ type: "text" as const, text }));

  const results = await Promise.allSettled(
    teamNumbers.map(async (to) => {
      const res = await fetch(
        `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to,
            type: "template",
            template: {
              name: templateName,
              language: { code: templateLang },
              components: [{ type: "body", parameters: bodyParams }],
            },
          }),
        },
      );
      if (!res.ok) {
        const err = await res.text();
        throw new Error(`WhatsApp send to ${to} failed (${res.status}): ${err}`);
      }
    }),
  );

  for (const result of results) {
    if (result.status === "rejected") {
      console.error("[sendInquiryWhatsAppNotification]", result.reason);
    }
  }
}
