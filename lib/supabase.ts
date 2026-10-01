import { createBrowserClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  return { url, anonKey };
}

/** Browser Supabase client — session stored in cookies via @supabase/ssr. */
export function createBrowserSupabaseClient() {
  const { url, anonKey } = getSupabaseConfig();
  return createBrowserClient(url, anonKey, {
    cookieOptions: {
      path: "/",
      sameSite: "lax",
    },
    auth: {
      detectSessionInUrl: false,
      flowType: "pkce",
      persistSession: true,
    },
  });
}

/** Server-side Supabase client (no persisted session). */
export function createServerSupabaseClient(): SupabaseClient {
  const { url, anonKey } = getSupabaseConfig();
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
