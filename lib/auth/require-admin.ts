import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Being signed in isn't enough. Supabase lets anyone holding the public anon
// key create an account, and admin actions write through the service-role
// client, which skips RLS entirely. So also check the `admins` table: the same
// list the is_admin() policies use. RLS lets a user read only their own row.
export async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data: admin } = await supabase
    .from("admins")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (!admin) throw new Error("You don't have permission to do that.");
  return user;
}
