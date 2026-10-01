import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { ROUTES } from "@/constants/routes";
import { isSuperAdminEmail } from "@/lib/superadmin";

const PUBLIC_PATHS = new Set<string>([ROUTES.LOGIN, ROUTES.HOME]);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.has(pathname) || pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isSuperAdmin = isSuperAdminEmail(user?.email);

  if ((!user || !isSuperAdmin) && pathname.startsWith("/platform")) {
    if (user && !isSuperAdmin) {
      await supabase.auth.signOut();
    }
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = ROUTES.LOGIN;
    loginUrl.searchParams.set("next", pathname);
    loginUrl.searchParams.set("reason", "unauthorized");
    return NextResponse.redirect(loginUrl);
  }

  if (user && isSuperAdmin && pathname === ROUTES.LOGIN) {
    const next = request.nextUrl.searchParams.get("next") || ROUTES.PLATFORM;
    const dest = request.nextUrl.clone();
    dest.pathname = next.startsWith("/") ? next : ROUTES.PLATFORM;
    dest.search = "";
    return NextResponse.redirect(dest);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
