import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isEmailApproved } from "@/lib/access";

const allowedDomain = process.env.NEXT_PUBLIC_ALLOWED_DOMAIN || "dutient.ai";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dutient-hrms-platform.netlify.app";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const requested = requestUrl.searchParams.get("redirect") || "";
  // Only same-site paths ("/candidates"), never "//other-site.com"
  const next = requested.startsWith("/") && !requested.startsWith("//") ? requested : "/dashboard";

  // ✅ Always redirect to production domain, not request.url
  const response = NextResponse.redirect(new URL(next, siteUrl));

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookies) {
          cookies.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !data.session) {
      // ✅ Use siteUrl here too
      const errorUrl = new URL("/login", siteUrl);
      errorUrl.searchParams.set("error", "oauth");
      return NextResponse.redirect(errorUrl);
    }

    const email = data.session.user.email?.toLowerCase() || "";
    if (!email.endsWith(`@${allowedDomain}`)) {
      await supabase.auth.signOut();
      // ✅ And here
      const errorUrl = new URL("/login", siteUrl);
      errorUrl.searchParams.set("error", "domain");
      return NextResponse.redirect(errorUrl);
    }

    // Signed in with a Dutient account but not approved yet → pending page
    if (!isEmailApproved(email)) {
      const pendingResponse = NextResponse.redirect(new URL("/access-pending", siteUrl));
      response.cookies.getAll().forEach((cookie) => pendingResponse.cookies.set(cookie));
      return pendingResponse;
    }
  }

  return response;
}