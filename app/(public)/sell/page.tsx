import type { Metadata } from "next";
import { SubmissionForm } from "@/components/public/SubmissionForm";
import { ShieldCheck, Clock, BadgeCheck, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "List Your Property — Garvoday Developers",
  description: "Want to sell or rent your property in Dehradun, Haridwar, or Rishikesh? List it free with Garvoday Developers and reach serious buyers.",
};

const WHY_ITEMS = [
  { icon: TrendingUp, title: "Wider Reach", desc: "Your property showcased to thousands of active buyers and tenants." },
  { icon: ShieldCheck, title: "Verified Listings", desc: "Every listing is reviewed by our team before going live." },
  { icon: BadgeCheck, title: "No Brokerage", desc: "Zero hidden charges. We handle the marketing, you close the deal." },
  { icon: Clock, title: "Quick Response", desc: "Our team contacts you within 24 hours of submission." },
];

export default function SellPage() {
  return (
    <main className="bg-[var(--color-sand)] min-h-screen">
      {/* Hero */}
      <div className="bg-[var(--color-brand)] py-14 px-4 text-center">
        <p className="text-[var(--color-gold)] text-xs font-bold tracking-[0.2em] uppercase mb-3">
          Sell or Rent
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
          List your property with us
        </h1>
        <p className="mt-3 text-white/60 text-sm max-w-md mx-auto">
          Reach thousands of verified buyers across Dehradun, Haridwar &amp; Rishikesh — completely free.
        </p>
      </div>

      {/* Why list with us */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {WHY_ITEMS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
              <span className="inline-flex w-11 h-11 rounded-full bg-[var(--color-brand)]/5 items-center justify-center mb-3">
                <Icon size={20} className="text-[var(--color-brand)]" />
              </span>
              <p className="font-bold text-sm text-[var(--color-brand)] mb-1">{title}</p>
              <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-10 max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-[var(--color-brand)] mb-1">Property Details</h2>
          <p className="text-sm text-gray-400 mb-7">
            Fill in the form below and our team will get back to you within 24 hours.
          </p>
          <SubmissionForm />
        </div>
      </div>
    </main>
  );
}
