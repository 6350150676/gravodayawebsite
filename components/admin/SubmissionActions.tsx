"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import Link from "next/link";
import {
  approveSubmissionAction,
  rejectSubmissionAction,
  updateSubmissionNotesAction,
  type ReviewResult,
} from "@/lib/actions/submission.actions";
import type { SubmissionStatus } from "@/types/database";
import { Check, ExternalLink, Loader2, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Lookup { id: number; name: string; slug: string }
interface LocalityRow { id: number; name: string; city_id: number }

export interface ReviewableSubmission {
  id: string;
  status: SubmissionStatus;
  admin_notes: string | null;
  property_type: string;
  city: string;
  locality: string | null;
  description: string | null;
  asking_price: number | null;
  area_sqft: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  imageCount: number;
  property: { id: string; slug: string; status: string } | null;
}

interface Props {
  submission: ReviewableSubmission;
  categories: Lookup[];
  cities: Lookup[];
  localities: LocalityRow[];
}

export function SubmissionActions({ submission, categories, cities, localities }: Props) {
  const [dialog, setDialog] = useState<"approve" | "reject" | null>(null);
  const { property, status } = submission;

  function done(result: ReviewResult) {
    if (!result.ok) return;
    setDialog(null);
    // The refreshed page usually moves this row off the current tab, taking
    // this component with it, so a warning can't wait for a re-render.
    if (result.warning) window.alert(result.warning);
  }

  return (
    <div className="flex flex-col gap-2">
      {property ? (
        <div className="flex flex-wrap gap-2">
          {property.status === "active" && (
            <Button asChild size="sm" variant="outline">
              <Link href={`/properties/${property.slug}`} target="_blank">
                <ExternalLink size={13} /> View listing
              </Link>
            </Button>
          )}
          <Button asChild size="sm">
            <Link href={`/admin/properties/${property.id}/edit`}>
              <Pencil size={13} /> Edit listing
            </Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => setDialog("approve")}>
            <Check size={14} /> {status === "approved" ? "Publish listing" : "Approve"}
          </Button>
          {status !== "rejected" && (
            <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => setDialog("reject")}>
              <X size={14} /> Reject
            </Button>
          )}
        </div>
      )}

      {property && property.status !== "active" && (
        <p className="text-[11px] text-gray-500">
          Listing is <span className="font-medium">{property.status}</span>, so it isn&apos;t public.
        </p>
      )}
      {status === "approved" && !property && (
        <p className="text-[11px] text-gray-500">Approved, but no listing exists (it may have been deleted).</p>
      )}

      <NotesEditor id={submission.id} currentNotes={submission.admin_notes} />

      <Modal
        open={dialog === "approve"}
        onClose={() => setDialog(null)}
        title="Approve and publish this property?"
        description="It will appear on the public Properties page straight away. Check the details the listing will go live with."
        wide
      >
        <ApproveForm
          submission={submission}
          categories={categories}
          cities={cities}
          localities={localities}
          onCancel={() => setDialog(null)}
          onDone={done}
        />
      </Modal>

      <Modal
        open={dialog === "reject"}
        onClose={() => setDialog(null)}
        title="Reject this submission?"
        description="It won't be published and will stay on this page under Rejected. The seller isn't notified automatically."
      >
        <RejectForm id={submission.id} onCancel={() => setDialog(null)} onDone={done} />
      </Modal>
    </div>
  );
}

// ── Approve ──────────────────────────────────────────────────────────

// The Sell form's property types, mapped onto the listing categories by slug.
const TYPE_CATEGORY: Record<string, string> = {
  Apartment: "residential",
  "Villa / House": "residential",
  "Plot / Land": "plots-land",
  "New Project Unit": "new-projects",
};

const TYPE_NOUN: Record<string, string> = {
  Apartment: "Apartment",
  "Villa / House": "House",
  "Plot / Land": "Plot",
  "New Project Unit": "Unit",
};

function sameName(a: string | null | undefined, b: string | null | undefined) {
  return !!a && !!b && a.trim().toLowerCase() === b.trim().toLowerCase();
}

function ApproveForm({
  submission: s,
  categories,
  cities,
  localities,
  onCancel,
  onDone,
}: Props & { onCancel: () => void; onDone: (r: ReviewResult) => void }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const defaultCity = cities.find((c) => sameName(c.name, s.city)) ?? (cities.length === 1 ? cities[0] : undefined);
  const [cityId, setCityId] = useState<number | "">(defaultCity?.id ?? "");
  const matchedLocality = localities.find((l) => l.city_id === defaultCity?.id && sameName(l.name, s.locality));
  const cityLocalities = localities.filter((l) => l.city_id === cityId);

  const noun = TYPE_NOUN[s.property_type] ?? "Property";
  const bhk = s.bedrooms && noun !== "Plot" ? `${s.bedrooms} BHK ` : "";
  const place = [...new Set([matchedLocality?.name ?? s.locality?.trim(), defaultCity?.name ?? s.city].filter(Boolean))].join(", ");
  const defaultTitle = `${bhk}${noun} in ${place}`;
  const defaultCategory = categories.find((c) => c.slug === TYPE_CATEGORY[s.property_type])?.id ?? "";

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      try {
        const result = await approveSubmissionAction(s.id, formData);
        if (result.ok) onDone(result);
        else setError(result.error);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't approve. Try again.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Listing title *">
        <input name="title" required minLength={5} maxLength={200} defaultValue={defaultTitle} className={input} />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Category *">
          <select name="category_id" required defaultValue={defaultCategory} className={input}>
            <option value="">Select category</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
        <Field label="Price (₹) *">
          <input name="price" type="number" required min={1} defaultValue={s.asking_price ?? ""} placeholder="e.g. 4500000" className={input} />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="City *">
          <select
            name="city_id"
            required
            value={cityId}
            onChange={(e) => setCityId(e.target.value ? Number(e.target.value) : "")}
            className={input}
          >
            <option value="">Select city</option>
            {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
        <Field label="Locality">
          <select name="locality_id" defaultValue={matchedLocality?.id ?? ""} className={input}>
            <option value="">None / not listed</option>
            {cityLocalities.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </Field>
      </div>

      <Field label="Address / area">
        <input
          name="address"
          maxLength={300}
          defaultValue={matchedLocality ? "" : (s.locality ?? "")}
          placeholder="Street, colony or landmark"
          className={input}
        />
      </Field>

      <div className="grid grid-cols-3 gap-3">
        <Field label="Area (sq.ft)">
          <input name="area_sqft" type="number" min={1} step="any" defaultValue={s.area_sqft ?? ""} className={input} />
        </Field>
        <Field label="Bedrooms">
          <input name="bedrooms" type="number" min={0} max={20} defaultValue={s.bedrooms ?? ""} className={input} />
        </Field>
        <Field label="Bathrooms">
          <input name="bathrooms" type="number" min={0} max={20} defaultValue={s.bathrooms ?? ""} className={input} />
        </Field>
      </div>

      <Field label="Description *">
        <textarea name="description" required minLength={10} maxLength={5000} rows={5} defaultValue={s.description ?? ""} className={input} />
      </Field>

      <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
        {s.imageCount
          ? `${s.imageCount} photo${s.imageCount === 1 ? "" : "s"} will be published; the first is the cover. `
          : "The seller didn't upload photos. "}
        Amenities, selling points, photos and everything else can be changed in the listing editor afterwards.
        The seller&apos;s contact details are never shown on the listing.
      </p>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="outline" onClick={onCancel} disabled={pending}>Cancel</Button>
        <Button type="submit" disabled={pending} className="bg-green-600 hover:bg-green-700 min-w-[160px]">
          {pending ? <><Loader2 size={15} className="animate-spin" /> Publishing…</> : <><Check size={15} /> Approve &amp; publish</>}
        </Button>
      </div>
    </form>
  );
}

// ── Reject ───────────────────────────────────────────────────────────

function RejectForm({ id, onCancel, onDone }: { id: string; onCancel: () => void; onDone: (r: ReviewResult) => void }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const result = await rejectSubmissionAction(id, reason);
        if (result.ok) onDone(result);
        else setError(result.error);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't reject. Try again.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Reason (optional)">
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          maxLength={1000}
          placeholder="e.g. Couldn't verify ownership, duplicate listing…"
          className={input}
        />
      </Field>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={pending}>Cancel</Button>
        <Button type="submit" variant="destructive" disabled={pending} className="min-w-[150px]">
          {pending ? <><Loader2 size={15} className="animate-spin" /> Rejecting…</> : "Reject submission"}
        </Button>
      </div>
    </form>
  );
}

// ── Notes ────────────────────────────────────────────────────────────

function NotesEditor({ id, currentNotes }: { id: string; currentNotes: string | null }) {
  const [isPending, startTransition] = useTransition();
  const [notes, setNotes] = useState(currentNotes ?? "");
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSaveNotes() {
    setError(null);
    startTransition(async () => {
      try {
        await updateSubmissionNotesAction(id, notes);
        setOpen(false);
      } catch {
        setError("Failed to save notes — try again");
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-xs text-[var(--color-brand)] hover:underline w-fit"
      >
        {currentNotes ? "Edit notes" : "+ Add notes"}
      </button>

      {open && (
        <div className="mt-1 space-y-2">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Internal notes about this submission…"
            className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/20"
          />
          <Button size="sm" onClick={handleSaveNotes} disabled={isPending}>
            {isPending ? <Loader2 size={13} className="animate-spin" /> : "Save"}
          </Button>
        </div>
      )}

      {error && <p className="text-[11px] text-red-500">{error}</p>}

      {currentNotes && !open && (
        <p className="text-xs text-gray-500 italic">&ldquo;{currentNotes}&rdquo;</p>
      )}
    </>
  );
}

// ── Shared ───────────────────────────────────────────────────────────

// Native <dialog>, as in ScheduleVisitDialog: focus trap, Esc and the backdrop
// for free. The body only mounts while open so each opening starts fresh.
function Modal({
  open,
  onClose,
  title,
  description,
  wide = false,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby={titleId}
      className={`w-[calc(100vw-2rem)] ${wide ? "max-w-2xl" : "max-w-md"} rounded-2xl bg-white p-0 shadow-2xl backdrop:bg-black/50 open:m-auto`}
      style={{ maxHeight: "min(92vh, 52rem)" }}
    >
      {open && (
        <div className="max-h-[inherit] overflow-y-auto">
          <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-4">
            <div className="min-w-0">
              <h2 id={titleId} className="text-base font-bold text-gray-900">{title}</h2>
              <p className="mt-1 text-xs text-gray-500">{description}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="-mr-1 shrink-0 rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          </div>
          <div className="px-6 py-5">{children}</div>
        </div>
      )}
    </dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {children}
    </div>
  );
}

const input = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/20 bg-white";
