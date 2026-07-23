"use client";

import { useActionState } from "react";
import { createSubmissionAction, type SubmissionFormState } from "@/lib/actions/submission.actions";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useLeadPixel } from "@/lib/meta-pixel";
import { FeedbackForm } from "@/components/public/FeedbackForm";

const PROPERTY_TYPES = ["Apartment", "Villa / House", "Plot / Land", "New Project Unit", "Other"];
const CITIES = ["Haridwar"];

const initialState: SubmissionFormState = { ok: false };

export function SubmissionForm() {
  const [state, action, pending] = useActionState(createSubmissionAction, initialState);
  useLeadPixel(state.ok, { content_category: "Seller Submission" });

  if (state.ok) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
        <CheckCircle2 size={52} className="text-green-500" />
        <h3 className="text-xl font-bold text-[var(--color-brand)]">Submission received!</h3>
        <p className="text-sm text-gray-500 max-w-sm">
          Thank you for listing with Garvoday Developers. Our team will review your property and get in touch within 24 hours.
        </p>
        <FeedbackForm source="submission" />
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5">
      {/* Honeypot */}
      <input type="text" name="company" className="hidden" tabIndex={-1} autoComplete="off" />

      {/* Section: Your Details */}
      <div>
        <p className="text-xs font-bold text-[var(--color-brand)] uppercase tracking-widest mb-3">Your Details</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full Name *" error={state.fieldErrors?.name}>
            <input name="name" type="text" placeholder="Rahul Sharma" className={inp(!!state.fieldErrors?.name)} required />
          </Field>
          <Field label="Phone Number *" error={state.fieldErrors?.phone}>
            <input name="phone" type="tel" placeholder="9876543210" maxLength={10} className={inp(!!state.fieldErrors?.phone)} required />
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Email (optional)" error={state.fieldErrors?.email}>
            <input name="email" type="email" placeholder="rahul@example.com" className={inp(!!state.fieldErrors?.email)} />
          </Field>
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* Section: Property Details */}
      <div>
        <p className="text-xs font-bold text-[var(--color-brand)] uppercase tracking-widest mb-3">Property Details</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Property Type *" error={state.fieldErrors?.property_type}>
            <select name="property_type" className={inp(!!state.fieldErrors?.property_type)} defaultValue="" required>
              <option value="" disabled>Select type…</option>
              {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="City *" error={state.fieldErrors?.city}>
            <select name="city" className={inp(!!state.fieldErrors?.city)} defaultValue="" required>
              <option value="" disabled>Select city…</option>
              {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <Field label="Locality / Area" error={state.fieldErrors?.locality}>
            <input name="locality" type="text" placeholder="e.g. Kankhal" className={inp(!!state.fieldErrors?.locality)} />
          </Field>
          <Field label="Asking Price (₹)" error={state.fieldErrors?.asking_price}>
            <input name="asking_price" type="text" placeholder="e.g. 45,00,000" className={inp(!!state.fieldErrors?.asking_price)} />
          </Field>
        </div>

        <div className="mt-4">
          <Field label="Property Description *" error={state.fieldErrors?.description}>
            <textarea
              name="description"
              rows={5}
              placeholder="Describe your property — size, condition, nearby landmarks, why you're selling…"
              className={inp(!!state.fieldErrors?.description) + " resize-none"}
              required
            />
          </Field>
        </div>
      </div>

      {state.error && <p className="text-sm text-red-500">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full flex items-center justify-center gap-2 bg-[var(--color-brand)] hover:bg-[var(--color-royal)] text-white font-bold text-sm px-6 py-4 rounded-xl transition-colors disabled:opacity-60"
      >
        {pending && <Loader2 size={16} className="animate-spin" />}
        {pending ? "Submitting…" : "Submit My Property"}
      </button>

      <p className="text-center text-xs text-gray-400">
        No charges. Our team will contact you within 24 hours.
      </p>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function inp(hasError: boolean) {
  return `w-full rounded-xl border px-4 py-3 text-sm text-gray-800 placeholder-gray-300 outline-none transition-colors focus:ring-2 focus:ring-[var(--color-brand)]/30 bg-gray-50 ${
    hasError ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-[var(--color-brand)]"
  }`;
}
