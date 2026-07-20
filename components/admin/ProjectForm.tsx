"use client";

import { useRef, useState, useActionState, startTransition } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";
import type { ProjectWithRelations } from "@/types";

// Downscale to JPEG via canvas before upload; falls back to the original file.
async function compressImage(file: File, maxWidth = 1600, maxHeight = 1200, quality = 0.85): Promise<File> {
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

interface Props {
  action: (prev: string | null, formData: FormData) => Promise<string | null>;
  project?: ProjectWithRelations;
  cities: Lookup[];
}

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export function ProjectForm({ action, project, cities }: Props) {
  const [error, formAction, isPending] = useActionState(action, null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [compressing, setCompressing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

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
    formData.delete("images");
    selectedFiles.forEach((file) => formData.append("images", file));
    startTransition(() => formAction(formData));
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Basic Info */}
      <section className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">Basic Information</h2>

        <Field label="Project Name *">
          <input name="name" required defaultValue={project?.name}
            className={input} placeholder="e.g. Palm City" />
        </Field>

        <Field label="Tagline">
          <input name="tagline" defaultValue={project?.tagline ?? ""}
            className={input} placeholder="e.g. Gated colony with plots &amp; villas near Roorkee" />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="City">
            <select name="city_id" defaultValue={project?.city?.id ?? ""} className={input}>
              <option value="">Select city</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Location">
            <input name="location" defaultValue={project?.location ?? ""}
              className={input} placeholder="e.g. Near Roorkee, Haridwar region" />
          </Field>
        </div>

        <Field label="Description *">
          <textarea name="description" required rows={10} defaultValue={project?.description}
            className={input} placeholder="Colony overview, layout details, specs, amenities..." />
        </Field>

        <Field label="Payment Plan">
          <textarea name="payment_plan" rows={8} defaultValue={project?.payment_plan ?? ""}
            className={input} placeholder="Price breakup, booking amount, construction milestones..." />
        </Field>

        <Field label="Brochure URL">
          <input name="brochure_url" type="url" defaultValue={project?.brochure_url ?? ""}
            className={input} placeholder="https://..." />
        </Field>
      </section>

      {/* Images */}
      <section className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">Images</h2>
        <p className="text-xs text-gray-400 -mt-2">Layout plan, floor plans, site photos — first image becomes cover.</p>

        {project?.images && project.images.length > 0 && (
          <div>
            <p className="text-sm text-gray-500 mb-2">Existing images (manage on the edit page)</p>
            <div className="flex flex-wrap gap-3">
              {[...project.images]
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((img) => (
                  <div key={img.id} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`${supabaseUrl}/storage/v1/object/public/project-images/${img.storage_path}`}
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
                {i === 0 && !project?.images.length && (
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Status *">
            <select name="status" required defaultValue={project?.status ?? "active"} className={input}>
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </Field>

          <Field label="Featured?">
            <select name="is_featured" defaultValue={project?.is_featured ? "true" : "false"} className={input}>
              <option value="false">No</option>
              <option value="true">Yes — show on homepage</option>
            </select>
          </Field>
        </div>
      </section>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending} className="min-w-[140px]">
          {isPending ? <><Loader2 size={16} className="animate-spin" /> Saving…</> : project ? "Update Project" : "Create Project"}
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
