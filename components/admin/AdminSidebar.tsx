import Link from "next/link";
import { logoutAction } from "@/lib/actions/auth.actions";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Building2,
  MessageSquare,
  FileText,
  LogOut,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/properties", label: "Properties", icon: Building2 },
  { href: "/admin/inquiries", label: "Inquiries", icon: MessageSquare },
  { href: "/admin/submissions", label: "Submissions", icon: FileText },
];

export function AdminSidebar() {
  return (
    <aside className="w-60 min-h-screen bg-[var(--color-brand)] text-white flex flex-col">
      {/* Brand */}
      <div className="px-6 py-5 border-b border-white/10">
        <span className="text-lg font-bold tracking-wide">Gravodaya</span>
        <span className="block text-xs text-white/50 mt-0.5">Admin Panel</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <form action={logoutAction}>
          <Button
            type="submit"
            variant="ghost"
            className="w-full justify-start gap-3 text-white/80 hover:text-white hover:bg-white/10"
          >
            <LogOut size={18} />
            Sign Out
          </Button>
        </form>
      </div>
    </aside>
  );
}
