"use client";

import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";
import type { PropertyWithRelations } from "@/types";

/** Compress an image file in the browser using Canvas before upload.
 *  Outputs a JPEG Blob capped at maxWidth × maxHeight, quality 0.82.
 *  Keeps aspect ratio. Falls back to original if Canvas isn't available. */
async function compressImage(file: File, maxWidth = 1280, maxHeight = 960, quality = 0.82): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(file); return; }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) { resolve(file); return; }
          resolve(new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" }));
        },
        "image/jpeg",
        quality,
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}

interface Lookup { id: number; name: string; slug: string }
interface LocalityRow { id: number; name: string; slug: string; city_id: number }

interface Props {
  action: (formData: FormData) => Promise<void>;
  property?: PropertyWithRelations;
  categories: Lookup[];
  cities: Lookup[];
  localities: LocalityRow[];
}

const AMENITIES_LIST = [
  "Parking", "Lift", "Power Backup", "Security", "CCTV",
  "Swimming Pool", "Gym", "Club House", "Garden", "Water Supply 24x7",
  "Gated Community", "Modular Kitchen", "Balcony", "Servant Room",
];

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "sold", label: "Sold" },
  { value: "rented", label: "Rented" },
  { value: "inactive", label: "Inactive" },
];

export function PropertyForm({ action, property, categories, cities, localities }: Props) {
  const [isPending, startTransition] = useTransition();
  const [selectedCityId, setSelectedCityId] = useState<number>(property?.city.id ?? 0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [compressing, setCompressing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const filteredLocalities = localities.filter((l) => l.city_id === selectedCityId);

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const incoming = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!incoming.length) return;
    setCompressing(true);
    const compressed = await Promise.all(incoming.map((f) => compressImage(f)));
    setSelectedFiles((prev) => [...prev, ...compressed]);
    setCompressing(false);
  }

  function removeFile(index: number) {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    // Remove whatever the file input holds (it was reset after each pick)
    // and inject the accumulated files from state
    formData.delete("images");
    selectedFiles.forEach((file) => formData.append("images", file));
    startTransition(() => action(formData));
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Info */}
      <section className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">Basic Information</h2>

        <Field label="Title *">
          <input name="title" required defaultValue={property?.title}
            className={input} placeholder="e.g. 3BHK Apartment in Rajpur Road" />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Category *">
            <select name="category_id" required defaultValue={property?.category.id} className={input}>
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>

          <Field label="Listing Type *">
            <select name="is_for_rent" required defaultValue={property?.is_for_rent ? "true" : "false"} className={input}>
              <option value="false">For Sale</option>
              <option value="true">For Rent</option>
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Price (₹) *">
            <input name="price" type="number" required min={1} defaultValue={property?.price}
              className={input} placeholder="e.g. 4500000" />
          </Field>
          <Field label="Price Label">
            <input name="price_label" defaultValue={property?.price_label ?? ""}
              className={input} placeholder="e.g. ₹45 L onwards" />
          </Field>
        </div>

        <Field label="Description *">
          <textarea name="description" required rows={5} defaultValue={property?.description}
            className={input} placeholder="Describe the property..." />
        </Field>
      </section>

      {/* Location */}
      <section className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">Location</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="City *">
            <select name="city_id" required defaultValue={property?.city.id}
              onChange={(e) => setSelectedCityId(Number(e.target.value))} className={input}>
              <option value="">Select city</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>

          <Field label="Locality">
            <select name="locality_id" defaultValue={property?.locality?.id ?? ""} className={input}>
              <option value="">Select locality</option>
              {filteredLocalities.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Full Address">
          <input name="address" defaultValue={property?.address ?? ""}
            className={input} placeholder="Street / Society name" />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Map Latitude">
            <input name="map_lat" type="number" step="any" defaultValue={property?.map_lat ?? ""}
              className={input} placeholder="e.g. 30.3165" />
          </Field>
          <Field label="Map Longitude">
            <input name="map_lng" type="number" step="any" defaultValue={property?.map_lng ?? ""}
              className={input} placeholder="e.g. 78.0322" />
          </Field>
        </div>
      </section>

      {/* Details */}
      <section className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">Property Details</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Area (sq.ft)">
            <input name="area_sqft" type="number" min={1} defaultValue={property?.area_sqft ?? ""}
              className={input} placeholder="e.g. 1200" />
          </Field>
          <Field label="Bedrooms">
            <input name="bedrooms" type="number" min={0} max={20} defaultValue={property?.bedrooms ?? ""}
              className={input} placeholder="e.g. 3" />
          </Field>
          <Field label="Bathrooms">
            <input name="bathrooms" type="number" min={0} max={20} defaultValue={property?.bathrooms ?? ""}
              className={input} placeholder="e.g. 2" />
          </Field>
        </div>

        <Field label="Amenities">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
            {AMENITIES_LIST.map((a) => (
              <label key={a} className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="amenities" value={a}
                  defaultChecked={property?.amenities.includes(a)}
                  className="rounded border-gray-300" />
                {a}
              </label>
            ))}
          </div>
        </Field>
      </section>

      {/* Images */}
      <section className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">Images</h2>

        {/* Existing images */}
        {property?.images && property.images.length > 0 && (
          <div>
            <p className="text-sm text-gray-500 mb-2">Existing images (manage on the edit page)</p>
            <div className="flex flex-wrap gap-3">
              {[...property.images]
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((img) => (
                  <div key={img.id} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`${supabaseUrl}/storage/v1/object/public/property-images/${img.storage_path}`}
                      alt=""
                      className="w-24 h-24 object-cover rounded-lg border"
                    />
                    {img.is_cover && (
                      <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1 rounded">Cover</span>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">
            Upload images{" "}
            <span className="text-gray-400 font-normal">
              — first image becomes cover. You can add more after selecting.
            </span>
          </p>
          <label className={`inline-flex items-center gap-2 cursor-pointer bg-[var(--color-brand)] text-white text-sm font-semibold px-4 py-2 rounded-full transition-opacity ${compressing ? "opacity-60 pointer-events-none" : "hover:opacity-90"}`}>
            {compressing ? <><Loader2 size={14} className="animate-spin" /> Compressing…</> : "+ Add Images"}
            <input
              ref={fileRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFiles}
              className="sr-only"
              disabled={compressing}
            />
          </label>
        </div>

        {selectedFiles.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {selectedFiles.map((file, i) => (
              <div key={`${file.name}-${i}`} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-24 h-24 object-cover rounded-lg border"
                />
                {i === 0 && !property?.images.length && (
                  <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1 rounded">
                    Cover
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5"
                >
                  <X size={10} />
                </button>
                <p className="text-[10px] text-gray-400 mt-0.5 w-24 truncate">{file.name}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Status & Flags */}
      <section className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">Status</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Status *">
            <select name="status" required defaultValue={property?.status ?? "active"} className={input}>
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </Field>

          <Field label="Featured?">
            <select name="is_featured" defaultValue={property?.is_featured ? "true" : "false"} className={input}>
              <option value="false">No</option>
              <option value="true">Yes — show on homepage</option>
            </select>
          </Field>
        </div>
      </section>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending} className="min-w-[140px]">
          {isPending ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : property ? "Update Property" : "Create Property"}
        </Button>
        <Button type="button" variant="outline" onClick={() => history.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  );
}

const input = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[var(--color-brand)] focus:ring-2 focus:ring-[var(--color-brand)]/20 bg-white";
