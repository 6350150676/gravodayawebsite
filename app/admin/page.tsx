import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const [
    { count: propertyCount },
    { count: inquiryCount },
    { count: submissionCount },
  ] = await Promise.all([
    supabase.from("properties").select("*", { count: "exact", head: true }),
    supabase.from("inquiries").select("*", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("seller_submissions").select("*", { count: "exact", head: true }).eq("status", "pending"),
  ]);

  const stats = [
    { label: "Total Properties", value: propertyCount ?? 0 },
    { label: "New Inquiries", value: inquiryCount ?? 0 },
    { label: "Pending Submissions", value: submissionCount ?? 0 },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-4">
        {stats.map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-3xl font-bold text-[var(--color-brand)] mt-1">
              {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
