import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;

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

/** Browser Supabase client for OTP / session auth. */
export function createBrowserSupabaseClient(): SupabaseClient {
  if (typeof window === "undefined") {
    return createClient(getSupabaseConfig().url, getSupabaseConfig().anonKey);
  }

  if (!browserClient) {
    const { url, anonKey } = getSupabaseConfig();
    browserClient = createClient(url, anonKey);
  }

  return browserClient;
}

/** Server-side Supabase client (no persisted session). */
export function createServerSupabaseClient(): SupabaseClient {
  const { url, anonKey } = getSupabaseConfig();
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
