import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isEmailApproved } from "@/lib/access";

// Pages anyone can open without signing in
const PUBLIC_ROUTES = ["/", "/login", "/auth/callback"];
// Pages a signed-in but not-yet-approved user can open
const PENDING_ROUTES = ["/access-pending"];

const matches = (pathname: string, routes: string[]) =>
  routes.some((route) => pathname === route || (route !== "/" && pathname.startsWith(`${route}/`)));

/**
 * Gatekeeper for every page and server action (server actions POST to the
 * page's own path, so they pass through here too).
 *   - not signed in      → /login
 *   - signed in, not on the allowlist → /access-pending
 */
export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  let response = NextResponse.next({ request });

  if (matches(pathname, PUBLIC_ROUTES)) return response;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // getUser() verifies the session with Supabase (getSession() only reads the cookie)
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (!isEmailApproved(user.email)) {
    if (matches(pathname, PENDING_ROUTES)) return response;
    return NextResponse.redirect(new URL("/access-pending", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    // Everything except Next.js internals and static files
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
