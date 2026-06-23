import Link from "next/link";
import PropertyCard from "@/components/PropertyCard";
import { properties } from "@/lib/properties";

export default function HomePage() {
  const featured = properties.filter((p) => p.featured);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand text-white">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 py-24 md:py-32">
          <h1 className="max-w-2xl text-4xl font-bold leading-tight md:text-5xl">
            Find Your Dream Home in{" "}
            <span className="text-gold">Uttarakhand</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-gray-200">
            Premium apartments, villas, plots and commercial spaces in Dehradun,
            Mussoorie and beyond — handpicked by Gravodaya Developers.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/properties"
              className="rounded-full bg-gold px-7 py-3 font-semibold text-brand transition hover:bg-gold-light"
            >
              Browse Properties
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-white/40 px-7 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Featured properties */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold text-brand">
              Featured Properties
            </h2>
            <p className="mt-2 text-gray-600">
              Our most popular listings, picked just for you.
            </p>
          </div>
          <Link
            href="/properties"
            className="hidden text-sm font-semibold text-gold hover:underline md:block"
          >
            View all →
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      </section>

      {/* About / Why us */}
      <section className="bg-white py-16">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-3">
          {[
            {
              icon: "🏠",
              title: "Verified Listings",
              text: "Every property is verified with clear titles and approvals for your peace of mind.",
            },
            {
              icon: "🤝",
              title: "Transparent Deals",
              text: "No hidden charges. Honest pricing and guidance through every step.",
            },
            {
              icon: "⭐",
              title: "Trusted Locally",
              text: "Years of experience serving families across Uttarakhand.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-gray-100 bg-gray-50 p-8 text-center"
            >
              <div className="text-4xl">{f.icon}</div>
              <h3 className="mt-4 text-lg font-semibold text-brand">
                {f.title}
              </h3>
              <p className="mt-2 text-sm text-gray-600">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gold">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-12 text-center md:flex-row md:text-left">
          <div>
            <h2 className="text-2xl font-bold text-brand">
              Ready to find your perfect property?
            </h2>
            <p className="mt-1 text-brand/80">
              Talk to our team today and get personalised recommendations.
            </p>
          </div>
          <Link
            href="/contact"
            className="rounded-full bg-brand px-7 py-3 font-semibold text-white transition hover:bg-brand-light"
          >
            Get in Touch
          </Link>
        </div>
      </section>
    </>
  );
}
