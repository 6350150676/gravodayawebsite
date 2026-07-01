import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/queries/site-content";
import { ContactForm } from "@/components/public/ContactForm";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us — Garvoday Developers",
  description: "Get in touch with Garvoday Developers for property inquiries, site visits, or any questions about real estate in Dehradun, Haridwar & Rishikesh.",
};

export default async function ContactPage() {
  const settings = await getSiteSettings();

  return (
    <main className="bg-[var(--color-sand)] min-h-screen">
      {/* Hero */}
      <div className="bg-[var(--color-brand)] py-14 px-4 text-center">
        <p className="text-[var(--color-gold)] text-xs font-bold tracking-[0.2em] uppercase mb-3">
          Get In Touch
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
          We&apos;re here to help
        </h1>
        <p className="mt-3 text-white/60 text-sm max-w-md mx-auto">
          Have a question about a property or want to schedule a site visit? Drop us a message and we&apos;ll get back to you promptly.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">

          {/* Contact Form */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
            <h2 className="text-xl font-bold text-[var(--color-brand)] mb-1">Send us a message</h2>
            <p className="text-sm text-gray-400 mb-6">We typically respond within a few hours.</p>
            <ContactForm />
          </div>

          {/* Info sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
              <h3 className="text-base font-bold text-[var(--color-brand)]">Contact Details</h3>

              <InfoRow icon={Phone} label="Phone">
                <a href={`tel:${settings.phone_tel}`} className="text-[var(--color-royal)] font-semibold hover:underline">
                  {settings.phone_display}
                </a>
              </InfoRow>

              <InfoRow icon={Mail} label="Email">
                <a href={`mailto:${settings.contact_email}`} className="text-[var(--color-royal)] font-semibold hover:underline break-all">
                  {settings.contact_email}
                </a>
              </InfoRow>

              <InfoRow icon={MapPin} label="Office">
                <span className="text-gray-600">{settings.contact_address}</span>
              </InfoRow>

              <InfoRow icon={Clock} label="Hours">
                <span className="text-gray-600">Mon – Sat, 9:00 AM – 7:00 PM</span>
              </InfoRow>
            </div>

            {/* WhatsApp CTA */}
            <a
              href={`https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent("Hi, I'd like to enquire about a property.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white font-semibold text-sm px-4 py-3.5 rounded-xl transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.117 1.528 5.845L0 24l6.337-1.508A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.372l-.36-.213-3.76.895.952-3.667-.234-.376A9.818 9.818 0 1112 21.818z"/>
              </svg>
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Phone;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <span className="flex-shrink-0 w-9 h-9 rounded-full bg-[var(--color-brand)]/5 flex items-center justify-center mt-0.5">
        <Icon size={16} className="text-[var(--color-brand)]" />
      </span>
      <div>
        <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
        {children}
      </div>
    </div>
  );
}
