import type { Metadata } from "next";
import Image from "next/image";
import { ShieldCheck, HeartHandshake, Sparkles, Target } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Garvoday Developers is Haridwar's trusted real estate partner — learn about our story, our values, and our vision for the city.",
  alternates: { canonical: "/about" },
};

const VALUES = [
  { icon: ShieldCheck, title: "Transparency", desc: "No hidden charges, no fine print — every deal is explained in plain language." },
  { icon: HeartHandshake, title: "Trust", desc: "We treat every property like it's our own family's home." },
  { icon: Target, title: "Local Expertise", desc: "Deep, on-ground knowledge of Haridwar's neighborhoods, pricing, and paperwork." },
  { icon: Sparkles, title: "Simplicity", desc: "We handle the complexity so buying, renting, or selling feels effortless." },
];

export default function AboutPage() {
  return (
    <main className="bg-[var(--color-sand)] min-h-screen">
      {/* Hero */}
      <div className="relative py-20 px-4 text-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1622611908679-cbeda47d9404?w=1800&q=80&auto=format&fit=crop"
          alt="Har Ki Pauri ghat, Haridwar"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-brand)]/90 to-[var(--color-brand)]/80" />
        <div className="relative z-10">
          <p className="text-[var(--color-gold)] text-xs font-bold tracking-[0.2em] uppercase mb-3">
            About Us
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
            Garvoday Developers
          </h1>
          <p className="mt-3 text-white/60 text-sm max-w-lg mx-auto">
            Garvoday Realty, by Garvoday Developers Pvt. Ltd. — committed to helping families find their dream homes.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-14">

        {/* Our Story */}
        <section className="grid sm:grid-cols-2 gap-8 items-center">
          <div>
            <p className="text-[var(--color-gold)] text-xs font-bold tracking-[0.2em] uppercase mb-3">Our Story</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-brand)] mb-4">Rooted in Haridwar</h2>
            <p className="text-gray-600 leading-relaxed text-[15px]">
              Garvoday Realty, by Garvoday Developers Pvt. Ltd., is built around a simple idea: know Haridwar deeply
              and do right by every client. From established neighborhoods to fastest-growing pockets, we bring
              hands-on, honest guidance to every stage of buying or selling a home.
            </p>
          </div>
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-sm order-first sm:order-last">
            <Image
              src="https://images.unsplash.com/photo-1724432799555-6414c4a669b9?w=900&q=80&auto=format&fit=crop"
              alt="Ganga Aarti gathering on the ghats of Haridwar"
              fill
              className="object-cover"
              sizes="(max-width:640px) 100vw, 50vw"
            />
          </div>
        </section>

        {/* Vision */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="relative aspect-[16/9]">
            <Image
              src="https://images.unsplash.com/photo-1706808849780-7a04fbac83ef?w=1200&q=80&auto=format&fit=crop"
              alt="Luxury villa in a premium residential colony"
              fill
              className="object-cover"
              sizes="(max-width:768px) 100vw, 768px"
            />
          </div>
          <div className="p-6 sm:p-10">
            <p className="text-[var(--color-gold)] text-xs font-bold tracking-[0.2em] uppercase mb-3">Our Vision</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-brand)] mb-4">
              To be Haridwar's most trusted real estate partner
            </h2>
            <p className="text-gray-600 leading-relaxed text-[15px]">
              We want every buyer, tenant, and seller in Haridwar to think of Garvoday first — not because we're the
              biggest, but because we're the most transparent, the most responsive, and the most invested in getting
              them the right property, not just any property. As Haridwar grows, we want to grow with it: building
              long-term relationships, championing fair pricing, and setting the standard for how real estate should
              be done in the city.
            </p>
          </div>
        </section>

        {/* Values */}
        <section>
          <p className="text-[var(--color-gold)] text-xs font-bold tracking-[0.2em] uppercase mb-3 text-center">What We Stand For</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-brand)] mb-8 text-center">Our Values</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
                <span className="inline-flex w-11 h-11 rounded-full bg-[var(--color-brand)]/5 items-center justify-center mb-3">
                  <Icon size={20} className="text-[var(--color-brand)]" />
                </span>
                <p className="font-bold text-sm text-[var(--color-brand)] mb-1">{title}</p>
                <p className="text-xs text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
