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

// Same client, but with Next's fetch data cache switched off.
//
// A page that declares `revalidate` hands that value down to every fetch it
// makes, so supabase-js responses get stored in the data cache keyed by request
// URL. That layer is invisible: revalidatePath() throws away the rendered HTML
// but not those entries, so the page regenerates and reads the very same
// snapshot back. It also survives redeploys. The home page sat on a snapshot
// with no projects in it for exactly that reason.
//
// Only for callers that do their own caching via unstable_cache with a tag we
// can bust — a no-store fetch anywhere else would force the route dynamic and
// undo ISR. Inside unstable_cache it stays static.
let uncached: ReturnType<typeof createSupabaseClient<Database>> | null = null;

export function createUncachedPublicClient() {
  if (!uncached) {
    uncached = createSupabaseClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: { persistSession: false, autoRefreshToken: false },
        global: {
          fetch: (input: RequestInfo | URL, init?: RequestInit) =>
            fetch(input, { ...init, cache: "no-store" }),
        },
      },
    );
  }
  return uncached;
}
