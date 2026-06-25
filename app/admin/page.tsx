import { unstable_noStore as noStore } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminDashboardPage() {
  noStore();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const [
    { count: propertyCount },
    { count: inquiryCount },
    { count: submissionCount },
    { data: recentInquiriesRaw },
  ] = await Promise.all([
    supabase.from("properties").select("*", { count: "exact", head: true }),
    supabase.from("inquiries").select("*", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("seller_submissions").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase
      .from("inquiries")
      .select("id, name, phone, created_at, status")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  type RecentInquiry = { id: string; name: string; phone: string; created_at: string; status: string };
  const recentInquiries = (recentInquiriesRaw ?? []) as unknown as RecentInquiry[];

  const stats = [
    { label: "Total Properties", value: propertyCount ?? 0, href: "/admin/properties" },
    { label: "New Inquiries", value: inquiryCount ?? 0, href: "/admin/inquiries?status=new" },
    { label: "Pending Submissions", value: submissionCount ?? 0, href: "/admin/submissions?status=pending" },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(({ label, value, href }) => (
          <Link key={label} href={href} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-3xl font-bold text-[var(--color-brand)] mt-1">{value}</p>
          </Link>
        ))}
      </div>

      {/* Recent inquiries */}
      {recentInquiries && recentInquiries.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h2 className="font-semibold text-gray-800">Recent Inquiries</h2>
            <Link href="/admin/inquiries" className="text-sm text-[var(--color-brand)] hover:underline">
              View all →
            </Link>
          </div>
          <ul className="divide-y">
            {recentInquiries.map((inq) => (
              <li key={inq.id} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-900">{inq.name}</p>
                  <p className="text-xs text-gray-400">{inq.phone}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full ${
                    inq.status === "new" ? "bg-blue-50 text-blue-700" :
                    inq.status === "contacted" ? "bg-yellow-50 text-yellow-700" :
                    "bg-gray-100 text-gray-500"
                  }`}>
                    {inq.status}
                  </span>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(inq.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
