import { redirect } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getAdminContent } from "@/lib/queries/content-admin";
import { SaveButton } from "@/components/admin/SaveButton";
import {
  updateSettingsAction,
  updateStatsAction,
  updateFeaturesAction,
  updateCitiesMetaAction,
  updateIntentCardsAction,
} from "@/lib/actions/content.actions";

const inputCls =
  "w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white outline-none focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/15";

export default async function AdminContentPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const content = await getAdminContent();

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Site Content</h1>
        <p className="text-sm text-gray-500 mt-1">
          Edit the marketing content shown on the public website — no code changes needed.
        </p>
      </div>

      {!content.ready && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
          <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Content tables not found.</p>
            <p className="mt-1">
              Run the <code className="bg-amber-100 px-1 rounded">20240002000000_site_content.sql</code>{" "}
              migration in the Supabase SQL Editor to enable editing. Until then the site
              shows the built-in default content and saving here will fail.
            </p>
          </div>
        </div>
      )}

      {/* ── Contact & brand ─────────────────────────────────────── */}
      <Section title="Contact & Brand" desc="Phone, email and address used across the header, footer and property pages.">
        <form action={updateSettingsAction} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field name="phone_display" label="Phone (display)" defaultValue={content.settings.phone_display} />
            <Field name="phone_tel" label="Phone (dial / tel:)" defaultValue={content.settings.phone_tel} />
            <Field name="whatsapp_number" label="WhatsApp number (e.g. 9198…)" defaultValue={content.settings.whatsapp_number} />
            <Field name="contact_email" label="Email" defaultValue={content.settings.contact_email} />
            <Field name="contact_address" label="Address" defaultValue={content.settings.contact_address} className="sm:col-span-2" />
            <Field name="company_tagline" label="Company tagline" defaultValue={content.settings.company_tagline} />
            <div className="grid grid-cols-2 gap-4">
              <Field name="rating_value" label="Rating value" defaultValue={content.settings.rating_value} />
              <Field name="rating_count" label="Rating count" defaultValue={content.settings.rating_count} />
            </div>
          </div>
          <SaveButton />
        </form>
      </Section>

      {/* ── Hero ────────────────────────────────────────────────── */}
      <Section title="Homepage Hero" desc="The big banner at the top of the homepage. The last word of the title is highlighted in gold.">
        <form action={updateSettingsAction} className="space-y-4">
          <Field name="hero_badge" label="Badge text" defaultValue={content.settings.hero_badge} />
          <Field name="hero_title" label="Title" defaultValue={content.settings.hero_title} />
          <Field name="hero_subtitle" label="Subtitle" defaultValue={content.settings.hero_subtitle} />
          <Field name="hero_image_url" label="Hero background image URL" defaultValue={content.settings.hero_image_url} />
          <Field name="whyus_image_url" label="'Why choose us' image URL" defaultValue={content.settings.whyus_image_url} />
          <SaveButton />
        </form>
      </Section>

      {/* ── Stats ───────────────────────────────────────────────── */}
      <Section title="Stats Counters" desc="The animated numbers strip (years of experience, happy families, etc.).">
        {content.stats.length === 0 ? (
          <Empty />
        ) : (
          <form action={updateStatsAction} className="space-y-3">
            {content.stats.map((s) => (
              <div key={s.id} className="grid grid-cols-[1fr_90px_70px] gap-2 items-center">
                <input type="hidden" name="stat_id" value={s.id} />
                <input name="stat_label" defaultValue={s.label} className={inputCls} placeholder="Label" />
                <input name="stat_value" type="number" defaultValue={s.value} className={inputCls} placeholder="Value" />
                <input name="stat_suffix" defaultValue={s.suffix} className={inputCls} placeholder="+ / %" />
              </div>
            ))}
            <SaveButton />
          </form>
        )}
      </Section>

      {/* ── Why choose us ───────────────────────────────────────── */}
      <Section title="“Why Choose Us” Points" desc="One bullet point per line.">
        <form action={updateFeaturesAction} className="space-y-4">
          <textarea
            name="features"
            rows={7}
            defaultValue={content.features.map((f) => f.text).join("\n")}
            className={`${inputCls} font-mono leading-relaxed`}
            placeholder="One point per line…"
          />
          <SaveButton />
        </form>
      </Section>

      {/* ── Prime locations ─────────────────────────────────────── */}
      <Section title="Prime Locations" desc="Tagline and photo for each city card on the homepage.">
        {content.cities.length === 0 ? (
          <Empty />
        ) : (
          <form action={updateCitiesMetaAction} className="space-y-5">
            {content.cities.map((c) => (
              <div key={c.id} className="rounded-lg border border-gray-100 p-4 space-y-3">
                <input type="hidden" name="city_id" value={c.id} />
                <p className="text-sm font-semibold text-gray-800">{c.name}</p>
                <Field name="city_tagline" label="Tagline" defaultValue={c.tagline ?? ""} />
                <Field name="city_image" label="Image URL" defaultValue={c.image_url ?? ""} />
              </div>
            ))}
            <SaveButton />
          </form>
        )}
      </Section>

      {/* ── Intent cards ────────────────────────────────────────── */}
      <Section title="Buy / Rent / Sell Cards" desc="The three promo cards in the “What are you looking for?” section.">
        {content.intentCards.length === 0 ? (
          <Empty />
        ) : (
          <form action={updateIntentCardsAction} className="space-y-5">
            {content.intentCards.map((card) => (
              <div key={card.id} className="rounded-lg border border-gray-100 p-4 space-y-3">
                <input type="hidden" name="card_id" value={card.id} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field name="card_title" label="Title" defaultValue={card.title} />
                  <Field name="card_subtitle" label="Subtitle" defaultValue={card.subtitle ?? ""} />
                </div>
                <Field name="card_description" label="Description" defaultValue={card.description ?? ""} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field name="card_cta" label="Button text" defaultValue={card.cta ?? ""} />
                  <Field name="card_href" label="Link (href)" defaultValue={card.href} />
                </div>
                <Field name="card_image" label="Image URL" defaultValue={card.image_url ?? ""} />
                <Field name="card_accent" label="Accent colour (CSS)" defaultValue={card.accent} />
              </div>
            ))}
            <SaveButton />
          </form>
        )}
      </Section>
    </div>
  );
}

/* ── presentational helpers (server) ───────────────────────────── */

function Section({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-base font-bold text-gray-900">{title}</h2>
      <p className="text-xs text-gray-500 mt-1 mb-5">{desc}</p>
      {children}
    </section>
  );
}

function Field({
  name, label, defaultValue, className = "",
}: { name: string; label: string; defaultValue?: string; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-xs font-medium text-gray-500 mb-1">{label}</span>
      <input name={name} defaultValue={defaultValue} className={inputCls} />
    </label>
  );
}

function Empty() {
  return <p className="text-sm text-gray-400">Run the content migration to manage this section.</p>;
}
