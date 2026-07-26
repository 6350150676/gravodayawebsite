import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// Cookie-free anon client for public, read-only queries.
//
// The cookie-bound client in ./server calls next/headers cookies(), which opts
// any page touching it into dynamic rendering — that silently disabled ISR
// site-wide (even on routes that declare `export const revalidate`). Public
// pages only ever read anon-visible rows (RLS: active properties/projects plus
// the public lookup + site_content tables), so they never needed a session.
//
// Admin reads must keep using ./server — they rely on the logged-in session for
// the is_admin() policies that expose draft/inactive rows.

let cached: ReturnType<typeof createSupabaseClient<Database>> | null = null;

export function createPublicClient() {
  if (!cached) {
    cached = createSupabaseClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
  }
  return cached;
}
