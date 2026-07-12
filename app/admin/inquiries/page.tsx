import { unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getInquiries } from "@/lib/queries/inquiries";
import { InquiryStatusSelect } from "@/components/admin/InquiryStatusSelect";
import type { InquiryStatus } from "@/types/database";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Inquiries — Admin" };

const TABS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "closed", label: "Closed" },
];

interface Props {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminInquiriesPage({ searchParams }: Props) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  noStore();
  const { status: rawStatus = "all" } = await searchParams;
  const VALID = ["all", "new", "contacted", "closed"];
  const status = VALID.includes(rawStatus) ? rawStatus : "all";
  const inquiries = await getInquiries(status);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Inquiries</h1>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-6 bg-white rounded-xl shadow-sm p-1.5 w-fit">
        {TABS.map((tab) => (
          <Link
            key={tab.value}
            href={`/admin/inquiries?status=${tab.value}`}
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

      {!inquiries.length ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center text-gray-400">
          No inquiries yet{status !== "all" ? ` with status "${status}"` : ""}.
        </div>
      ) : (
        <div className="space-y-3">
          {inquiries.map((inq) => (
            <div key={inq.id} className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                {/* Contact info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-900">{inq.name}</p>
                    <InquiryStatusSelect
                      id={inq.id}
                      current={inq.status as InquiryStatus}
                    />
                  </div>

                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-sm text-gray-500">
                    <a href={`tel:${inq.phone}`} className="hover:text-[var(--color-brand)]">
                      📞 {inq.phone}
                    </a>
                    {inq.email && (
                      <a href={`mailto:${inq.email}`} className="hover:text-[var(--color-brand)]">
                        ✉️ {inq.email}
                      </a>
                    )}
                    <span className="text-gray-400">
                      {new Date(inq.created_at).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </span>
                  </div>

                  {/* Property */}
                  {inq.property && (
                    <p className="mt-1.5 text-sm">
                      <span className="text-gray-400">Property: </span>
                      <Link
                        href={`/admin/properties/${inq.property.id}/edit`}
                        className="text-[var(--color-brand)] font-medium hover:underline"
                      >
                        {inq.property.title}
                      </Link>
                    </p>
                  )}

                  {/* Message */}
                  {inq.message && (
                    <p className="mt-2 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
                      {inq.message}
                    </p>
                  )}
                </div>

                {/* Quick action */}
                <div className="flex gap-2 flex-shrink-0">
                  <a
                    href={`tel:${inq.phone}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Call
                  </a>
                  {inq.email && (
                    <a
                      href={`mailto:${inq.email}?subject=Re: Your property inquiry`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-brand)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                      Reply
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
