"use client";

import { useState } from "react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    // TODO: wire this up to the backend / database once it's set up.
    // For now we just show a success message on the frontend.
    console.log("Contact form submitted:", form);
    setSubmitted(true);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-bold text-brand">Contact Us</h1>
      <p className="mt-2 text-gray-600">
        Have a question or want to schedule a visit? Send us a message and our
        team will get back to you.
      </p>

      <div className="mt-10 grid gap-10 md:grid-cols-2">
        {/* Form */}
        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
          {submitted ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="text-5xl">✅</div>
              <h2 className="mt-4 text-xl font-semibold text-brand">
                Thank you!
              </h2>
              <p className="mt-2 text-gray-600">
                Your message has been received. We&apos;ll contact you shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <Field
                label="Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />
              <Field
                label="Phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                required
              />
              <Field
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Message
                </label>
                <textarea
                  name="message"
                  rows={4}
                  value={form.message}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gold focus:ring-1 focus:ring-gold"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-full bg-brand px-6 py-3 font-semibold text-white transition hover:bg-brand-light"
              >
                Send Message
              </button>
            </form>
          )}
        </div>

        {/* Contact info */}
        <div className="space-y-6">
          <InfoBlock
            icon="📍"
            title="Office Address"
            lines={["Rajpur Road", "Dehradun, Uttarakhand 248001"]}
          />
          <InfoBlock
            icon="📞"
            title="Phone"
            lines={["+91 63501 50676"]}
          />
          <InfoBlock
            icon="✉️"
            title="Email"
            lines={["info@gravodaya.com"]}
          />
          <InfoBlock
            icon="🕒"
            title="Working Hours"
            lines={["Mon – Sat: 9:00 AM – 7:00 PM", "Sunday: By appointment"]}
          />
        </div>
      </div>
    </div>
  );
}

function Field({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        {...props}
        className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gold focus:ring-1 focus:ring-gold"
      />
    </div>
  );
}

function InfoBlock({ icon, title, lines }) {
  return (
    <div className="flex gap-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-gray-200">
      <div className="text-2xl">{icon}</div>
      <div>
        <h3 className="font-semibold text-brand">{title}</h3>
        {lines.map((l) => (
          <p key={l} className="text-sm text-gray-600">
            {l}
          </p>
        ))}
      </div>
    </div>
  );
}
