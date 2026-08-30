"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { PROJECT_ICON_KEYS, projectIcon } from "@/lib/project-icons";
import {
  parseAmenityGroups,
  parseCharges,
  parseHighlights,
  parseLocationAdvantages,
  parsePaymentRows,
  parseSpecs,
} from "@/lib/project-content";
import type {
  ProjectAmenityGroup,
  ProjectCharge,
  ProjectHighlight,
  ProjectLocationAdvantage,
  ProjectPaymentRow,
  ProjectSpec,
  ProjectWithRelations,
} from "@/types";

// Each section is a list the admin grows and shrinks; the page renders however
// many entries exist, so there are no required counts and no fixed slots.
// State lives here and is mirrored into one hidden JSON input per section, which
// is what the server action reads — the same parsers run on both sides, so what
// you see in this editor is exactly what the public page will make of it.

const input =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-(--color-brand) focus:ring-2 focus:ring-(--color-brand)/20 bg-white";

interface Props {
  project?: ProjectWithRelations;
}

export function ProjectContentEditor({ project }: Props) {
  const [specs, setSpecs] = useState<ProjectSpec[]>(() => parseSpecs(project?.key_specs));
  const [highlights, setHighlights] = useState<ProjectHighlight[]>(() =>
    parseHighlights(project?.highlights),
  );
  const [amenities, setAmenities] = useState<ProjectAmenityGroup[]>(() =>
    parseAmenityGroups(project?.amenity_groups),
  );
  const [locations, setLocations] = useState<ProjectLocationAdvantage[]>(() =>
    parseLocationAdvantages(project?.location_advantages),
  );
  const [payments, setPayments] = useState<ProjectPaymentRow[]>(() =>
    parsePaymentRows(project?.payment_plans),
  );
  const [charges, setCharges] = useState<ProjectCharge[]>(() =>
    parseCharges(project?.additional_charges),
  );

  return (
    <>
      <section className="rounded-xl border border-dashed border-(--color-brand)/25 bg-(--color-brand)/5 p-5">
        <h2 className="font-semibold text-gray-800">Detail page sections</h2>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
          Everything below is optional, and every list grows to whatever this project needs — the
          page lays out four highlights or nine, two amenity categories or five, and hides any
          section you leave empty.
        </p>
        <p className="text-xs text-gray-500 mt-2 leading-relaxed">
          <strong className="font-semibold">Leave the highlights, amenities and location lists
          empty</strong> and the site reads them out of the description above — its ALL-CAPS
          headings and bullet lists — so an older project still gets the full layout. Fill in any
          one of the three and this panel takes over for all three. The payment plan works the same
          way, on its own.
        </p>
      </section>

      {/* ── Key specs ────────────────────────────────────────────── */}
      <Section
        title="Key Specifications"
        hint="Quick facts shown as a strip under the project name — possession date, total units, land area, RERA status. Leave empty to hide the strip."
        count={specs.length}
        name="key_specs"
        value={specs}
        onAdd={() => setSpecs((v) => [...v, { label: "", value: "" }])}
        addLabel="Add specification"
      >
        {specs.map((row, i) => (
          <Row key={i} index={i} list={specs} setList={setSpecs} label={row.label || "New specification"}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Labeled label="Label">
                <input
                  className={input}
                  placeholder="e.g. Possession"
                  value={row.label}
                  onChange={(e) => setSpecs(patch(specs, i, { label: e.target.value }))}
                />
              </Labeled>
              <Labeled label="Value">
                <input
                  className={input}
                  placeholder="e.g. Dec 2027"
                  value={row.value}
                  onChange={(e) => setSpecs(patch(specs, i, { value: e.target.value }))}
                />
              </Labeled>
            </div>
          </Row>
        ))}
      </Section>

      {/* ── Highlights ───────────────────────────────────────────── */}
      <Section
        title="Key Project Highlights"
        hint="The icon-and-title cards near the top of the page — Prime Location, Spacious Residences, Secure & Smart. Add as many or as few as this project needs; the grid re-flows."
        count={highlights.length}
        name="highlights"
        value={highlights}
        onAdd={() => setHighlights((v) => [...v, { icon: "", title: "", description: "" }])}
        addLabel="Add highlight"
      >
        {highlights.map((row, i) => (
          <Row key={i} index={i} list={highlights} setList={setHighlights} label={row.title || "New highlight"}>
            <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-3">
              <Labeled label="Icon">
                <IconPicker
                  value={row.icon}
                  guessFrom={`${row.title} ${row.description}`}
                  onChange={(icon) => setHighlights(patch(highlights, i, { icon }))}
                />
              </Labeled>
              <Labeled label="Title">
                <input
                  className={input}
                  placeholder="e.g. Prime Location"
                  value={row.title}
                  onChange={(e) => setHighlights(patch(highlights, i, { title: e.target.value }))}
                />
              </Labeled>
            </div>
            <Labeled label="Short description">
              <textarea
                className={input}
                rows={2}
                placeholder="One or two lines explaining the highlight."
                value={row.description}
                onChange={(e) => setHighlights(patch(highlights, i, { description: e.target.value }))}
              />
            </Labeled>
          </Row>
        ))}
      </Section>

      {/* ── Amenities ────────────────────────────────────────────── */}
      <Section
        title="Amenities"
        hint="One card per category — Signature Amenities, Lifestyle Features, Smart & Interiors. Put one amenity per line in the list box."
        count={amenities.length}
        name="amenity_groups"
        value={amenities}
        onAdd={() => setAmenities((v) => [...v, { icon: "", title: "", items: [] }])}
        addLabel="Add amenity category"
      >
        {amenities.map((row, i) => (
          <Row key={i} index={i} list={amenities} setList={setAmenities} label={row.title || "New category"}>
            <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-3">
              <Labeled label="Category icon">
                <IconPicker
                  value={row.icon}
                  guessFrom={row.title}
                  onChange={(icon) => setAmenities(patch(amenities, i, { icon }))}
                />
              </Labeled>
              <Labeled label="Category title">
                <input
                  className={input}
                  placeholder="e.g. Signature Amenities"
                  value={row.title}
                  onChange={(e) => setAmenities(patch(amenities, i, { title: e.target.value }))}
                />
              </Labeled>
            </div>
            <Labeled label={`Amenities — one per line (${row.items.length})`}>
              <textarea
                className={`${input} font-mono text-xs`}
                rows={6}
                placeholder={"Swimming pool\nFully-equipped gym\nRooftop lounge"}
                value={row.items.join("\n")}
                onChange={(e) =>
                  setAmenities(
                    patch(amenities, i, {
                      // Split on save-as-you-type, but keep blank lines the admin
                      // is mid-way through typing — they're dropped on submit.
                      items: e.target.value.split("\n"),
                    }),
                  )
                }
              />
            </Labeled>
          </Row>
        ))}
      </Section>

      {/* ── Location advantages ──────────────────────────────────── */}
      <Section
        title="Location Advantage"
        hint="Nearby landmarks with a travel time or distance — Har Ki Pauri · 2 mins, Jolly Grant Airport · 30 mins."
        count={locations.length}
        name="location_advantages"
        value={locations}
        onAdd={() => setLocations((v) => [...v, { icon: "", place: "", distance: "" }])}
        addLabel="Add location"
      >
        {locations.map((row, i) => (
          <Row key={i} index={i} list={locations} setList={setLocations} label={row.place || "New location"}>
            <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr_160px] gap-3">
              <Labeled label="Icon">
                <IconPicker
                  value={row.icon}
                  guessFrom={row.place}
                  onChange={(icon) => setLocations(patch(locations, i, { icon }))}
                />
              </Labeled>
              <Labeled label="Place">
                <input
                  className={input}
                  placeholder="e.g. Har Ki Pauri"
                  value={row.place}
                  onChange={(e) => setLocations(patch(locations, i, { place: e.target.value }))}
                />
              </Labeled>
              <Labeled label="Time / distance">
                <input
                  className={input}
                  placeholder="e.g. 2 mins"
                  value={row.distance}
                  onChange={(e) => setLocations(patch(locations, i, { distance: e.target.value }))}
                />
              </Labeled>
            </div>
          </Row>
        ))}
      </Section>

      {/* ── Payment plan ─────────────────────────────────────────── */}
      <Section
        title="Payment Plan"
        hint="One row per unit type / configuration. Every field is free text, so “On request”, “₹85 L onwards” and “1,245 sq.ft.” all work. Leave the whole section empty and the page hides it."
        count={payments.length}
        name="payment_plans"
        value={payments}
        onAdd={() =>
          setPayments((v) => [
            ...v,
            { unit_type: "", tower: "", area: "", price: "", availability: "", charges: "", notes: "" },
          ])
        }
        addLabel="Add unit / payment row"
      >
        {payments.map((row, i) => (
          <Row key={i} index={i} list={payments} setList={setPayments} label={row.unit_type || "New unit"}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Labeled label="Unit type *">
                <input
                  className={input}
                  placeholder="e.g. 3 BHK"
                  value={row.unit_type}
                  onChange={(e) => setPayments(patch(payments, i, { unit_type: e.target.value }))}
                />
              </Labeled>
              <Labeled label="Tower / block">
                <input
                  className={input}
                  placeholder="e.g. Tower B"
                  value={row.tower}
                  onChange={(e) => setPayments(patch(payments, i, { tower: e.target.value }))}
                />
              </Labeled>
              <Labeled label="Area">
                <input
                  className={input}
                  placeholder="e.g. 1,245 sq.ft."
                  value={row.area}
                  onChange={(e) => setPayments(patch(payments, i, { area: e.target.value }))}
                />
              </Labeled>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Labeled label="Base price">
                <input
                  className={input}
                  placeholder="e.g. ₹85 L"
                  value={row.price}
                  onChange={(e) => setPayments(patch(payments, i, { price: e.target.value }))}
                />
              </Labeled>
              <Labeled label="Availability">
                <input
                  className={input}
                  placeholder="e.g. Available / Sold out"
                  value={row.availability}
                  onChange={(e) => setPayments(patch(payments, i, { availability: e.target.value }))}
                />
              </Labeled>
              <Labeled label="Additional charges">
                <input
                  className={input}
                  placeholder="e.g. + PLC as applicable"
                  value={row.charges}
                  onChange={(e) => setPayments(patch(payments, i, { charges: e.target.value }))}
                />
              </Labeled>
            </div>
            <Labeled label="Notes">
              <input
                className={input}
                placeholder="Anything specific to this configuration"
                value={row.notes}
                onChange={(e) => setPayments(patch(payments, i, { notes: e.target.value }))}
              />
            </Labeled>
          </Row>
        ))}
      </Section>

      {/* ── Additional charges ───────────────────────────────────── */}
      <Section
        title="Additional Charges"
        hint="Charges over and above the base price — PLC, floor rise, club membership, IFMS. Shown under the payment table."
        count={charges.length}
        name="additional_charges"
        value={charges}
        onAdd={() => setCharges((v) => [...v, { label: "", value: "", note: "" }])}
        addLabel="Add charge"
      >
        {charges.map((row, i) => (
          <Row key={i} index={i} list={charges} setList={setCharges} label={row.label || "New charge"}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Labeled label="Charge">
                <input
                  className={input}
                  placeholder="e.g. Park-facing PLC"
                  value={row.label}
                  onChange={(e) => setCharges(patch(charges, i, { label: e.target.value }))}
                />
              </Labeled>
              <Labeled label="Amount">
                <input
                  className={input}
                  placeholder="e.g. ₹150 / sq.ft."
                  value={row.value}
                  onChange={(e) => setCharges(patch(charges, i, { value: e.target.value }))}
                />
              </Labeled>
            </div>
            <Labeled label="Note">
              <input
                className={input}
                placeholder="Optional clarification"
                value={row.note}
                onChange={(e) => setCharges(patch(charges, i, { note: e.target.value }))}
              />
            </Labeled>
          </Row>
        ))}
      </Section>
    </>
  );
}

// ── Building blocks ────────────────────────────────────────────────

function patch<T>(list: T[], index: number, changes: Partial<T>): T[] {
  return list.map((row, i) => (i === index ? { ...row, ...changes } : row));
}

function Section<T>({
  title,
  hint,
  count,
  name,
  value,
  onAdd,
  addLabel,
  children,
}: {
  title: string;
  hint: string;
  count: number;
  name: string;
  value: T[];
  onAdd: () => void;
  addLabel: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white rounded-xl shadow-sm p-6 space-y-4">
      <div>
        <h2 className="font-semibold text-gray-800">
          {title}{" "}
          <span className="text-xs font-normal text-gray-400">
            {count === 0 ? "— section hidden on the site" : `· ${count}`}
          </span>
        </h2>
        <p className="text-xs text-gray-400 mt-1">{hint}</p>
      </div>

      {/* What the server action actually reads. */}
      <input type="hidden" name={name} value={JSON.stringify(value)} />

      {count > 0 && <div className="space-y-3">{children}</div>}

      <button
        type="button"
        onClick={onAdd}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-(--color-brand) border border-dashed border-(--color-brand)/40 rounded-lg px-3 py-2 hover:bg-(--color-brand)/5"
      >
        <Plus size={14} /> {addLabel}
      </button>
    </section>
  );
}

function Row<T>({
  index,
  list,
  setList,
  label,
  children,
}: {
  index: number;
  list: T[];
  setList: (v: T[]) => void;
  label: string;
  children: React.ReactNode;
}) {
  function move(dir: -1 | 1) {
    const to = index + dir;
    if (to < 0 || to >= list.length) return;
    const next = [...list];
    [next[index], next[to]] = [next[to], next[index]];
    setList(next);
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-gray-500 truncate">
          {index + 1}. {label}
        </p>
        <div className="flex items-center gap-1 shrink-0">
          <IconButton label="Move up" disabled={index === 0} onClick={() => move(-1)}>
            <ChevronUp size={14} />
          </IconButton>
          <IconButton label="Move down" disabled={index === list.length - 1} onClick={() => move(1)}>
            <ChevronDown size={14} />
          </IconButton>
          <IconButton
            label="Remove"
            danger
            onClick={() => setList(list.filter((_, i) => i !== index))}
          >
            <Trash2 size={14} />
          </IconButton>
        </div>
      </div>
      {children}
    </div>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`p-1.5 rounded-md border border-gray-200 bg-white disabled:opacity-35 disabled:cursor-not-allowed ${
        danger ? "text-red-500 hover:bg-red-50" : "text-gray-500 hover:bg-gray-100"
      }`}
    >
      {children}
    </button>
  );
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[11px] font-medium text-gray-500 mb-1">{label}</span>
      {children}
    </label>
  );
}

/**
 * Icon chooser with a live preview. "Auto" is the default and is not a missing
 * value — the site picks an icon from the title, which is right most of the
 * time, so an admin only has to touch this when the guess is wrong.
 */
function IconPicker({
  value,
  guessFrom,
  onChange,
}: {
  value: string;
  guessFrom: string;
  onChange: (icon: string) => void;
}) {
  const Preview = projectIcon(value, guessFrom);
  return (
    <div className="flex items-center gap-2">
      <span className="shrink-0 w-9 h-9 rounded-lg bg-(--color-brand)/10 flex items-center justify-center">
        <Preview size={16} className="text-(--color-brand)" />
      </span>
      <select className={input} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Auto (from title)</option>
        {PROJECT_ICON_KEYS.map((key) => (
          <option key={key} value={key}>
            {key.replace(/-/g, " ")}
          </option>
        ))}
      </select>
    </div>
  );
}
