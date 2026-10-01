import { createBrowserSupabaseClient } from "@/lib/supabase";
import { ROUTES } from "@/constants/routes";

const AUTH_PAGES = new Set<string>([ROUTES.LOGIN, ROUTES.HOME]);

let redirectingToLogin = false;

export async function signOutApp() {
  try {
    const supabase = createBrowserSupabaseClient();
    await supabase.auth.signOut();
  } catch {
    // Local session is already cleared.
  }
}

export function getJwtExpirySeconds(token: string): number | null {
  try {
    const segment = token.split(".")[1];
    if (!segment) return null;
    const normalized = segment.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      "=",
    );
    const payload = JSON.parse(atob(padded)) as { exp?: unknown };
    return typeof payload.exp === "number" ? payload.exp : null;
  } catch {
    return null;
  }
}

export function isJwtExpired(token: string, skewSeconds = 30): boolean {
  const exp = getJwtExpirySeconds(token);
  if (exp == null) return false;
  return exp * 1000 <= Date.now() + skewSeconds * 1000;
}

export async function redirectToLoginOnExpiry(
  reason: "expired" | "unauthorized" = "expired",
) {
  if (typeof window === "undefined" || redirectingToLogin) return;
  const path = window.location.pathname;
  if (AUTH_PAGES.has(path)) return;

  redirectingToLogin = true;
  try {
    await signOutApp();
  } finally {
    const params = new URLSearchParams({ reason });
    window.location.assign(`${ROUTES.LOGIN}?${params.toString()}`);
  }
}

export async function getAccessToken(): Promise<string | null> {
  try {
    const supabase = createBrowserSupabaseClient();
    const { data } = await supabase.auth.getSession();
    let session = data.session;

    if (session?.access_token && isJwtExpired(session.access_token)) {
      const refreshed = await supabase.auth.refreshSession();
      session = refreshed.data.session ?? null;
      if (!session?.access_token || isJwtExpired(session.access_token)) {
        await redirectToLoginOnExpiry("expired");
        return null;
      }
    }

    return session?.access_token ?? null;
  } catch {
    return null;
  }
}
