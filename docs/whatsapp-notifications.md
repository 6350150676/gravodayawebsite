# WhatsApp Team Notifications — Setup Guide

When someone submits an inquiry (contact/property form) or a seller listing, the site
sends a WhatsApp message with the person's name, phone, and message to every number in
`WHATSAPP_TEAM_NUMBERS`, using the official **Meta WhatsApp Cloud API**.

The feature is off until the env vars are set — the site works normally without them.

## One-time setup (~30–45 min)

### 1. Create the Meta app

1. Go to <https://developers.facebook.com/apps> and log in with the Facebook account
   that manages (or will manage) the Garvoday business.
2. **Create App** → type **Business** → link/create your **Meta Business Portfolio**.
3. On the app dashboard, add the **WhatsApp** product.

### 2. Get a phone number

- Meta gives you a **free test number** immediately — use it to verify everything works
  (test numbers can only message up to 5 pre-registered recipients, which is fine for a team).
- For production, add a real business number under **WhatsApp → API Setup → Add phone number**.
  ⚠️ The number must NOT already be registered on the WhatsApp app — it gets converted to
  an API-only number.

Copy the **Phone number ID** shown under API Setup → this is `WHATSAPP_PHONE_NUMBER_ID`.

### 3. Get a permanent access token

The token shown on the API Setup page expires in 24 hours. For a permanent one:

1. Business Settings (<https://business.facebook.com/settings>) → **Users → System users**
   → **Add** → create an Admin system user.
2. **Add Assets** → assign your app with full control.
3. **Generate New Token** → select your app → check permissions
   `whatsapp_business_messaging` and `whatsapp_business_management` → set expiry **Never**.

That token is `WHATSAPP_ACCESS_TOKEN`.

### 4. Create the message template

Business-initiated messages must use a pre-approved template.
Go to **WhatsApp Manager → Message templates → Create template**:

- **Category:** Utility
- **Name:** `new_inquiry`
- **Language:** English (`en`)
- **Body:**

  ```
  🔔 New inquiry from {{1}}
  📞 Phone: {{2}}
  🏠 Regarding: {{3}}
  💬 Details: {{4}}
  ```

Approval is usually automatic within minutes for Utility templates.
If you use a different name or language, set `WHATSAPP_TEMPLATE_NAME` / `WHATSAPP_TEMPLATE_LANG`.

### 5. Set the env vars

In `.env.local` (and in Vercel → Project → Settings → Environment Variables):

```
WHATSAPP_ACCESS_TOKEN=EAAG...        # permanent system-user token
WHATSAPP_PHONE_NUMBER_ID=1234567890
WHATSAPP_TEAM_NUMBERS=919876543210,919812345678
```

Numbers must include the country code (91 for India), digits only.

> If you're using the free **test number**, each team number must also be added as a
> recipient under WhatsApp → API Setup → "To" field → Manage phone number list
> (they'll receive a verification code on WhatsApp).

### 6. Test

Submit the contact form on the site — every team number should receive the template
message within a few seconds. Failures are logged on the server as
`[sendInquiryWhatsAppNotification]` and never block the inquiry itself.

## Costs

- Meta's API itself is free; you pay per delivered template message.
- Utility templates in India cost roughly ₹0.115 per message.
  Example: 10 inquiries/day × 3 team members ≈ ₹100/month.
