import { unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSubmissions } from "@/lib/queries/submissions";
import { SubmissionActions } from "@/components/admin/SubmissionActions";
import Link from "next/link";
import type { SubmissionStatus } from "@/types/database";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Submissions — Admin" };

const TABS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "published", label: "Published" },
];

interface Props {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminSubmissionsPage({ searchParams }: Props) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  noStore();
  const { status = "all" } = await searchParams;
  const submissions = await getSubmissions(status);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

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
          {submissions.map((sub) => (
            <div key={sub.id} className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex flex-col lg:flex-row lg:gap-6">

                {/* Images */}
                {sub.images.length > 0 && (
                  <div className="flex gap-2 mb-4 lg:mb-0 flex-shrink-0">
                    {sub.images.slice(0, 3).map((img) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={img.id}
                        src={`${supabaseUrl}/storage/v1/object/public/property-images/${img.storage_path}`}
                        alt=""
                        className="w-20 h-16 object-cover rounded-lg border"
                      />
                    ))}
                    {sub.images.length > 3 && (
                      <div className="w-20 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-sm text-gray-400">
                        +{sub.images.length - 3}
                      </div>
                    )}
                  </div>
                )}

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">

                    {/* Left: seller + property info */}
                    <div className="space-y-1">
                      <p className="font-semibold text-gray-900">{sub.name}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-sm text-gray-500">
                        <a href={`tel:${sub.phone}`} className="hover:text-[var(--color-brand)]">
                          📞 {sub.phone}
                        </a>
                        {sub.email && (
                          <a href={`mailto:${sub.email}`} className="hover:text-[var(--color-brand)]">
                            ✉️ {sub.email}
                          </a>
                        )}
                        <span className="text-gray-400">
                          {new Date(sub.created_at).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-sm mt-1">
                        <span>
                          <span className="text-gray-400">Type: </span>
                          <span className="text-gray-700 font-medium">{sub.property_type}</span>
                        </span>
                        <span>
                          <span className="text-gray-400">City: </span>
                          <span className="text-gray-700">{sub.city}</span>
                          {sub.locality && <span className="text-gray-400">, {sub.locality}</span>}
                        </span>
                        {sub.asking_price && (
                          <span>
                            <span className="text-gray-400">Asking: </span>
                            <span className="text-gray-700 font-medium">
                              ₹{(sub.asking_price / 100000).toFixed(1)} L
                            </span>
                          </span>
                        )}
                      </div>

                      {sub.description && (
                        <p className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2 mt-2">
                          {sub.description}
                        </p>
                      )}
                    </div>

                    {/* Right: actions */}
                    <div className="flex-shrink-0 min-w-[160px]">
                      <SubmissionActions
                        id={sub.id}
                        currentStatus={sub.status as SubmissionStatus}
                        currentNotes={sub.admin_notes}
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
