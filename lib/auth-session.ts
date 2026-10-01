import { createBrowserSupabaseClient } from "@/lib/supabase";

export async function signOutApp() {
  try {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
  } catch {
    // Local session is already cleared.
  }
}
