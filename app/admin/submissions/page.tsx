import { unstable_noStore as noStore } from "next/cache";
import { requireAdmin } from "@/lib/auth/require-admin";
import { getSubmissions } from "@/lib/queries/submissions";
import { getCategories, getCities, getLocalitiesByCity } from "@/lib/queries/properties";
import { SubmissionActions } from "@/components/admin/SubmissionActions";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import type { SubmissionStatus } from "@/types/database";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Submissions — Admin" };

const TABS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const STATUS_STYLES: Record<SubmissionStatus, string> = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  approved: "bg-green-50 text-green-700 border-green-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

interface Props {
  searchParams: Promise<{ status?: string }>;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default async function AdminSubmissionsPage({ searchParams }: Props) {
  await requireAdmin();

  noStore();
  const { status: rawStatus = "all" } = await searchParams;
  const status = TABS.some((t) => t.value === rawStatus) ? rawStatus : "all";

  const [submissions, categories, cities] = await Promise.all([
    getSubmissions(status),
    getCategories(),
    getCities(),
  ]);
  const localities = (await Promise.all(cities.map((c) => getLocalitiesByCity(c.id)))).flat();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Seller Submissions</h1>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-1 mb-6 bg-white rounded-xl shadow-sm p-1.5 w-fit">
        {TABS.map((tab) => (
          <Link
            key={tab.value}
            href={`/admin/submissions?status=${tab.value}`}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              status === tab.value
                ? "bg-[var(--color-brand)] text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {!submissions.length ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-400">
          No submissions{status !== "all" ? ` with status "${status}"` : ""} yet.
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub) => {
            const facts = [
              { label: "Type", value: sub.property_type },
              { label: "City", value: [sub.city, sub.locality].filter(Boolean).join(", ") },
              sub.asking_price && { label: "Asking", value: formatPrice(sub.asking_price) },
              sub.area_sqft && { label: "Area", value: `${sub.area_sqft.toLocaleString("en-IN")} sq.ft` },
              sub.bedrooms != null && { label: "Beds", value: String(sub.bedrooms) },
              sub.bathrooms != null && { label: "Baths", value: String(sub.bathrooms) },
            ].filter(Boolean) as { label: string; value: string }[];

            return (
              <div key={sub.id} className="bg-white rounded-xl shadow-sm p-5">
                <div className="flex flex-col lg:flex-row lg:gap-6">

                  {/* Details */}
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-gray-900">{sub.name}</p>
                        <span className={`text-xs font-medium border rounded-full px-2.5 py-0.5 capitalize ${STATUS_STYLES[sub.status]}`}>
                          {sub.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-sm text-gray-500">
                        <a href={`tel:${sub.phone}`} className="hover:text-[var(--color-brand)]">
                          📞 {sub.phone}
                        </a>
                        {sub.email && (
                          <a href={`mailto:${sub.email}`} className="hover:text-[var(--color-brand)]">
                            ✉️ {sub.email}
                          </a>
                        )}
                        <span className="text-gray-400">Submitted {formatDate(sub.created_at)}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-sm">
                      {facts.map((f) => (
                        <span key={f.label}>
                          <span className="text-gray-400">{f.label}: </span>
                          <span className="text-gray-700 font-medium">{f.value}</span>
                        </span>
                      ))}
                    </div>

                    {sub.description && (
                      <p className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2 whitespace-pre-line">
                        {sub.description}
                      </p>
                    )}

                    {/* Photos — private until approval, so these are signed links */}
                    {sub.images.length > 0 ? (
                      <div>
                        <p className="text-xs text-gray-400 mb-1.5">
                          {sub.images.length} photo{sub.images.length === 1 ? "" : "s"} · click to open full size
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {sub.images.map((img, i) =>
                            img.url ? (
                              <a key={img.id} href={img.url} target="_blank" rel="noopener noreferrer" className="relative block">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={img.url}
                                  alt={`Photo ${i + 1}`}
                                  className="w-24 h-20 object-cover rounded-lg border hover:opacity-90"
                                />
                                {i === 0 && (
                                  <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1 rounded">Cover</span>
                                )}
                              </a>
                            ) : (
                              <div key={img.id} className="w-24 h-20 rounded-lg border bg-gray-100 flex items-center justify-center text-[10px] text-gray-400">
                                Missing
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400">No photos uploaded.</p>
                    )}

                    {sub.status === "approved" && sub.approved_at && (
                      <p className="text-xs text-green-700">
                        Approved {formatDate(sub.approved_at)}
                        {sub.property && <> · listed as &ldquo;{sub.property.title}&rdquo;</>}
                      </p>
                    )}
                    {sub.status === "rejected" && (
                      <div className="text-xs text-red-700 bg-red-50 rounded-lg px-3 py-2">
                        Rejected{sub.rejected_at ? ` ${formatDate(sub.rejected_at)}` : ""}
                        {sub.rejection_reason ? <>: <span className="text-red-800">{sub.rejection_reason}</span></> : " (no reason given)"}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0 lg:w-56 mt-4 lg:mt-0">
                    <SubmissionActions
                      submission={{
                        id: sub.id,
                        status: sub.status,
                        admin_notes: sub.admin_notes,
                        property_type: sub.property_type,
                        city: sub.city,
                        locality: sub.locality,
                        description: sub.description,
                        asking_price: sub.asking_price,
                        area_sqft: sub.area_sqft,
                        bedrooms: sub.bedrooms,
                        bathrooms: sub.bathrooms,
                        imageCount: sub.images.length,
                        property: sub.property,
                      }}
                      categories={categories}
                      cities={cities}
                      localities={localities}
                    />

                    <div className="flex gap-2 mt-3">
                      <a
                        href={`tel:${sub.phone}`}
                        className="inline-flex items-center px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Call
                      </a>
                      {sub.email && (
                        <a
                          href={`mailto:${sub.email}?subject=Re: Your property submission`}
                          className="inline-flex items-center px-3 py-1.5 rounded-lg bg-[var(--color-brand)] text-white text-sm font-medium hover:opacity-90"
                        >
                          Reply
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
