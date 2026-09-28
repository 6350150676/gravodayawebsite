"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createSubmissionAction, type SubmissionFormState } from "@/lib/actions/submission.actions";
import { CheckCircle2, ImagePlus, Loader2, ShieldCheck, X } from "lucide-react";
import { usePixelOnce } from "@/lib/meta-pixel";
import { FeedbackForm } from "@/components/public/FeedbackForm";
import { compressImage } from "@/lib/images/compress-image";
import {
  LISTING_IMAGE_ACCEPT,
  MAX_PHOTO_BYTES,
  MAX_SUBMISSION_PHOTOS,
  MAX_UPLOAD_TOTAL_BYTES,
  isListingImageType,
} from "@/lib/images/limits";

const PROPERTY_TYPES = ["Apartment", "Villa / House", "Plot / Land", "New Project Unit", "Other"];
const CITIES = ["Haridwar"];

interface Photo {
  id: number;
  file: File;
  url: string;
}

export function SubmissionForm() {
  const [state, setState] = useState<SubmissionFormState>({ ok: false });
  const [pending, startTransition] = useTransition();
  usePixelOnce(state.ok, "Lead", { content_category: "Seller Submission" });

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [preparing, setPreparing] = useState(false);
  const [photoErrors, setPhotoErrors] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const nextId = useRef(0);

  // previews are object URLs; release them when the form goes away
  const photosRef = useRef(photos);
  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);
  useEffect(() => () => photosRef.current.forEach((p) => URL.revokeObjectURL(p.url)), []);

  // a server-side photo error refers to the old selection
  function clearServerPhotoError() {
    setState((s) => {
      if (!s.fieldErrors?.images) return s;
      const { images: _images, ...rest } = s.fieldErrors;
      return { ...s, error: undefined, fieldErrors: rest };
    });
  }

  async function addFiles(incoming: File[]) {
    if (!incoming.length) return;
    clearServerPhotoError();
    const errors: string[] = [];
    const accepted: File[] = [];

    for (const file of incoming) {
      if (!isListingImageType(file)) errors.push(`${file.name} isn't a JPG, PNG or WebP image.`);
      else if (file.size > MAX_PHOTO_BYTES) errors.push(`${file.name} is larger than 10 MB.`);
      else accepted.push(file);
    }

    const room = MAX_SUBMISSION_PHOTOS - photos.length;
    if (accepted.length > room) {
      const skipped = accepted.length - Math.max(room, 0);
      errors.push(
        `You can add up to ${MAX_SUBMISSION_PHOTOS} photos, so ${skipped} ${skipped === 1 ? "wasn't" : "weren't"} added.`,
      );
      accepted.splice(Math.max(room, 0));
    }

    setPhotoErrors(errors);
    if (!accepted.length) return;

    setPreparing(true);
    const compressed = await Promise.all(accepted.map((f) => compressImage(f, 1280, 960, 0.78)));
    setPhotos((prev) => [
      ...prev,
      ...compressed.map((file) => ({ id: nextId.current++, file, url: URL.createObjectURL(file) })),
    ]);
    setPreparing(false);
  }

  function removePhoto(id: number) {
    setPhotos((prev) => {
      const gone = prev.find((p) => p.id === id);
      if (gone) URL.revokeObjectURL(gone.url);
      return prev.filter((p) => p.id !== id);
    });
    setPhotoErrors([]);
    clearServerPhotoError();
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const total = photos.reduce((sum, p) => sum + p.file.size, 0);
    if (total > MAX_UPLOAD_TOTAL_BYTES) {
      setPhotoErrors(["Your photos are too large to send together. Remove a few and try again."]);
      return;
    }

    const formData = new FormData(e.currentTarget);
    photos.forEach((p) => formData.append("images", p.file));

    startTransition(async () => {
      try {
        setState(await createSubmissionAction(state, formData));
      } catch {
        // network drop, or a request over the server's size limit
        setState({
          ok: false,
          error: "Your submission couldn't be sent. Check your connection and try again, or try with fewer photos.",
        });
      }
    });
  }

  if (state.ok) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
        <CheckCircle2 size={52} className="text-green-500" />
        <h3 className="text-xl font-bold text-[var(--color-brand)]">Submission received!</h3>
        <p className="text-sm text-gray-500 max-w-sm">
          Thank you for listing with Garvoday Developers. Our team will review your property before it is
          published and get in touch within 24 hours.
        </p>
        <FeedbackForm source="submission" />
      </div>
    );
  }

  const busy = pending || preparing;
  const photoError = state.fieldErrors?.images;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          <Field label="Area (sq.ft)" error={state.fieldErrors?.area_sqft}>
            <input name="area_sqft" type="text" inputMode="decimal" placeholder="e.g. 1,200" className={inp(!!state.fieldErrors?.area_sqft)} />
          </Field>
          <Field label="Bedrooms" error={state.fieldErrors?.bedrooms}>
            <input name="bedrooms" type="number" min={0} max={20} placeholder="e.g. 3" className={inp(!!state.fieldErrors?.bedrooms)} />
          </Field>
          <Field label="Bathrooms" error={state.fieldErrors?.bathrooms}>
            <input name="bathrooms" type="number" min={0} max={20} placeholder="e.g. 2" className={inp(!!state.fieldErrors?.bathrooms)} />
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

      <hr className="border-gray-100" />

      {/* Section: Photos */}
      <div>
        <p className="text-xs font-bold text-[var(--color-brand)] uppercase tracking-widest mb-1">Photos</p>
        <p className="text-xs text-gray-400 mb-3">
          Good photos get more enquiries. The first photo is used as the cover.
        </p>

        {photos.length < MAX_SUBMISSION_PHOTOS && (
          <label
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              if (!busy) void addFiles(Array.from(e.dataTransfer.files));
            }}
            className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors ${
              busy ? "cursor-wait opacity-60" : "cursor-pointer"
            } ${
              dragging
                ? "border-[var(--color-brand)] bg-[var(--color-brand)]/5"
                : photoError
                  ? "border-red-400 bg-red-50"
                  : "border-gray-200 bg-gray-50 hover:border-[var(--color-brand)]/50"
            }`}
          >
            {preparing ? (
              <Loader2 size={22} className="animate-spin text-[var(--color-brand)]" />
            ) : (
              <ImagePlus size={22} className="text-[var(--color-brand)]" />
            )}
            <span className="text-sm font-semibold text-[var(--color-brand)]">
              {preparing ? "Preparing photos…" : photos.length ? "Add more photos" : "Add photos"}
            </span>
            <span className="text-xs text-gray-400">
              JPG, PNG or WebP · up to 10 MB each · max {MAX_SUBMISSION_PHOTOS} photos
            </span>
            <input
              type="file"
              multiple
              accept={LISTING_IMAGE_ACCEPT}
              disabled={busy}
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                e.target.value = "";
                void addFiles(files);
              }}
              className="sr-only"
            />
          </label>
        )}

        {photos.length > 0 && (
          <div className="mt-3 grid grid-cols-3 sm:grid-cols-5 gap-3">
            {photos.map((photo, i) => (
              <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                {i === 0 && (
                  <span className="absolute bottom-1.5 left-1.5 text-[10px] font-semibold bg-black/60 text-white px-1.5 py-0.5 rounded">
                    Cover
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removePhoto(photo.id)}
                  disabled={pending}
                  aria-label={`Remove photo ${i + 1}`}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 hover:bg-red-600 text-white flex items-center justify-center transition-colors disabled:opacity-50"
                >
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>
        )}

        {photos.length > 0 && (
          <p className="mt-2 text-xs text-gray-400">
            {photos.length} of {MAX_SUBMISSION_PHOTOS} photos
          </p>
        )}
        {[...photoErrors, ...(photoError && !photoErrors.includes(photoError) ? [photoError] : [])].map((msg) => (
          <p key={msg} className="mt-1.5 text-xs text-red-500">{msg}</p>
        ))}
      </div>

      <div className="flex items-start gap-2.5 rounded-xl bg-[var(--color-brand)]/5 px-4 py-3 text-sm text-[var(--color-brand)]">
        <ShieldCheck size={17} className="mt-0.5 flex-shrink-0" />
        <p>Your property will be reviewed by our team before it is published.</p>
      </div>

      {state.error && <p className="text-sm text-red-500">{state.error}</p>}

      <button
        type="submit"
        disabled={busy}
        className="w-full flex items-center justify-center gap-2 bg-[var(--color-brand)] hover:bg-[var(--color-royal)] text-white font-bold text-sm px-6 py-4 rounded-xl transition-colors disabled:opacity-60"
      >
        {pending && <Loader2 size={16} className="animate-spin" />}
        {pending ? (photos.length ? "Uploading photos…" : "Submitting…") : "Submit My Property"}
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
