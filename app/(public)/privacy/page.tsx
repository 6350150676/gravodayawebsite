import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Garvoday Developers collects, uses, and protects your personal information.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <main className="bg-[var(--color-sand)] min-h-screen">
      <div className="bg-[var(--color-brand)] py-14 px-4 text-center">
        <p className="text-[var(--color-gold)] text-xs font-bold tracking-[0.2em] uppercase mb-3">
          Legal
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
          Privacy Policy
        </h1>
        <p className="mt-3 text-white/60 text-sm max-w-lg mx-auto">
          Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10 text-gray-600 text-[15px] leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-[var(--color-brand)] mb-3">Information We Collect</h2>
          <p>
            When you contact us, submit a property inquiry, or list a property with us, we collect information you
            provide directly — such as your name, phone number, email address, and details about the property you're
            interested in buying, renting, or selling.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[var(--color-brand)] mb-3">How We Use It</h2>
          <p>
            We use your information to respond to inquiries, connect you with relevant property listings, and follow
            up on submissions. We do not sell your personal information to third parties. We may share necessary
            details with property owners or developers when facilitating a specific transaction you've requested.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[var(--color-brand)] mb-3">Data Security</h2>
          <p>
            We take reasonable technical and organizational measures to protect your personal information from
            unauthorized access, alteration, or disclosure.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[var(--color-brand)] mb-3">Cookies</h2>
          <p>
            Our website may use cookies and similar technologies to improve your browsing experience and understand
            how visitors use our site.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[var(--color-brand)] mb-3">Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy or how your data is handled, reach out to us via our{" "}
            <a href="/contact" className="text-[var(--color-brand)] underline">contact page</a>.
          </p>
        </section>
      </div>
    </main>
  );
}
