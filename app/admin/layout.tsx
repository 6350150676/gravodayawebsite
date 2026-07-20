import type { ReactNode } from "react";
import type { Metadata } from "next";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      {/* pt-14 on mobile to clear the fixed top bar; no padding on lg (sidebar is inline) */}
      <main className="flex-1 p-4 pt-18 lg:pt-4 lg:p-8 overflow-auto min-w-0">
        {children}
      </main>
    </div>
  );
}
