"use client";

import { useActionState } from "react";
import { createContactMessageAction, type ContactFormState } from "@/lib/actions/contact.actions";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useLeadPixel } from "@/lib/meta-pixel";

const initialState: ContactFormState = { ok: false };

export function ContactForm() {
  const [state, action, pending] = useActionState(createContactMessageAction, initialState);
  useLeadPixel(state.ok, { content_category: "Contact Form" });

  if (state.ok) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
        <CheckCircle2 size={48} className="text-green-500" />
        <h3 className="text-lg font-bold text-[var(--color-brand)]">Message received!</h3>
        <p className="text-sm text-gray-500 max-w-xs">
          Thank you for reaching out. We&apos;ll get back to you within a few hours.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      {/* Honeypot */}
      <input type="text" name="company" className="hidden" tabIndex={-1} autoComplete="off" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Full Name *" error={state.fieldErrors?.name}>
          <input
            name="name"
            type="text"
            placeholder="Rahul Sharma"
            className={input(!!state.fieldErrors?.name)}
            required
          />
        </Field>
        <Field label="Phone Number *" error={state.fieldErrors?.phone}>
          <input
            name="phone"
            type="tel"
            placeholder="9876543210"
            maxLength={10}
            className={input(!!state.fieldErrors?.phone)}
            required
          />
        </Field>
      </div>

      <Field label="Email (optional)" error={state.fieldErrors?.email}>
        <input
          name="email"
          type="email"
          placeholder="rahul@example.com"
          className={input(!!state.fieldErrors?.email)}
        />
      </Field>

      <Field label="Message *" error={state.fieldErrors?.message}>
        <textarea
          name="message"
          rows={5}
          placeholder="Tell us what you're looking for..."
          className={input(!!state.fieldErrors?.message) + " resize-none"}
          required
        />
      </Field>

      {state.error && (
        <p className="text-sm text-red-500">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full flex items-center justify-center gap-2 bg-[var(--color-brand)] hover:bg-[var(--color-royal)] text-white font-semibold text-sm px-6 py-3.5 rounded-xl transition-colors disabled:opacity-60"
      >
        {pending && <Loader2 size={16} className="animate-spin" />}
        {pending ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function input(hasError: boolean) {
  return `w-full rounded-xl border px-4 py-3 text-sm text-gray-800 placeholder-gray-300 outline-none transition-colors focus:ring-2 focus:ring-[var(--color-brand)]/30 ${
    hasError ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 focus:border-[var(--color-brand)]"
  }`;
}
