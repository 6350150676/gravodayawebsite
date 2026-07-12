import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Garvoday Developers",
  description: "The terms and conditions for using the Garvoday Developers website and services.",
};

export default function TermsPage() {
  return (
    <main className="bg-[var(--color-sand)] min-h-screen">
      <div className="bg-[var(--color-brand)] py-14 px-4 text-center">
        <p className="text-[var(--color-gold)] text-xs font-bold tracking-[0.2em] uppercase mb-3">
          Legal
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
          Terms of Service
        </h1>
        <p className="mt-3 text-white/60 text-sm max-w-lg mx-auto">
          Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10 text-gray-600 text-[15px] leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-[var(--color-brand)] mb-3">Using This Site</h2>
          <p>
            This website is provided by Garvoday Developers Pvt. Ltd. to help you browse, inquire about, and list
            properties in Haridwar. By using this site, you agree to provide accurate information when submitting
            inquiries or listings.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[var(--color-brand)] mb-3">Property Listings</h2>
          <p>
            While we make every effort to keep listings accurate and up to date, property availability, pricing, and
            specifications are subject to change without notice and should be independently verified before any
            transaction.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[var(--color-brand)] mb-3">No Guarantee of Sale or Rental</h2>
          <p>
            Garvoday Developers acts as a channel partner and facilitator between buyers, tenants, sellers, and
            developers. Submitting an inquiry or listing does not guarantee a completed transaction.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[var(--color-brand)] mb-3">Limitation of Liability</h2>
          <p>
            Garvoday Developers is not liable for any indirect or consequential loss arising from reliance on
            information published on this website.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[var(--color-brand)] mb-3">Contact Us</h2>
          <p>
            Questions about these Terms can be sent to us via our{" "}
            <a href="/contact" className="text-[var(--color-brand)] underline">contact page</a>.
          </p>
        </section>
      </div>
    </main>
  );
}
