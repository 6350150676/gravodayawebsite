"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2, Send, Phone } from "lucide-react";
import { createInquiryAction, type InquiryFormState } from "@/lib/actions/inquiry.actions";
import { useLeadPixel } from "@/lib/meta-pixel";

interface Props {
  propertyId: string;
  propertyTitle: string;
  phone?: string; // tel: target, e.g. +919876543210
}

const initial: InquiryFormState = { ok: false };

export function InquiryForm({ propertyId, propertyTitle, phone = "+919876543210" }: Props) {
  const [state, action] = useActionState(createInquiryAction, initial);
  useLeadPixel(state.ok, { content_name: propertyTitle, content_category: "Property Inquiry" });

  if (state.ok) {
    return (
      <div className="text-center py-6" role="status" aria-live="polite">
        <div className="mx-auto w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mb-4">
          <CheckCircle2 className="text-green-600" size={30} />
        </div>
        <h3 className="text-lg font-bold text-[var(--color-brand)]">Thank you!</h3>
        <p className="text-sm text-gray-500 mt-2 leading-relaxed">
          Your inquiry has been received. Our team will reach out to you shortly.
        </p>
        <a
          href={`tel:${phone}`}
          className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-brand)] hover:text-[var(--color-gold)] transition-colors"
        >
          <Phone size={14} /> Or call us now
        </a>
      </div>
    );
  }

  const err = state.fieldErrors ?? {};

  return (
    <form action={action} className="space-y-3.5">
      <input type="hidden" name="property_id" value={propertyId} />
      {/* Honeypot — hidden from humans, bots tend to fill it */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      <Field label="Your Name" name="name" placeholder="e.g. Rahul Sharma" error={err.name} required />
      <Field
        label="Phone Number"
        name="phone"
        type="tel"
        placeholder="10-digit mobile number"
        error={err.phone}
        required
      />
      <Field label="Email (optional)" name="email" type="email" placeholder="you@example.com" error={err.email} />

      <div>
        <label htmlFor="message" className="block text-xs font-semibold text-gray-600 mb-1.5">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={3}
          aria-invalid={!!err.message}
          aria-describedby={err.message ? "message-error" : undefined}
          defaultValue={`I'm interested in "${propertyTitle}". Please share more details.`}
          className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 outline-none resize-none focus:border-[var(--color-royal)] focus:ring-2 focus:ring-[var(--color-royal)]/15"
        />
        {err.message && <p id="message-error" className="text-xs text-red-500 mt-1">{err.message}</p>}
      </div>

      {state.error && (
        <p role="alert" aria-live="assertive" className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {state.error}
        </p>
      )}

      <SubmitButton />

      <p className="text-[11px] text-gray-400 text-center leading-relaxed">
        By submitting, you agree to be contacted about this property. We never share your details.
      </p>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  error,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-xs font-semibold text-gray-600 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        className={`w-full px-3.5 py-2.5 text-sm border rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-[var(--color-royal)]/15 ${
          error ? "border-red-300 focus:border-red-400" : "border-gray-200 focus:border-[var(--color-royal)]"
        }`}
      />
      {error && <p id={`${name}-error`} className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex items-center justify-center gap-2 bg-[var(--color-royal)] text-white font-bold text-sm px-5 py-3 rounded-xl hover:bg-[var(--color-royal-dark)] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {pending ? (
        <>
          <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          Sending…
        </>
      ) : (
        <>
          <Send size={15} /> Send Inquiry
        </>
      )}
    </button>
  );
}
