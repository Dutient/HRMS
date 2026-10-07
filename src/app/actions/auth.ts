"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type ActionState = { error?: string; success?: boolean; redirectTo?: string };

const allowedDomain = process.env.NEXT_PUBLIC_ALLOWED_DOMAIN || "dutient.ai";
const getSiteUrl = () => {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://dutient-hrms-platform.netlify.app";
};

export async function startGoogleOAuth() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${getSiteUrl()}/auth/callback`,
      queryParams: { hd: allowedDomain },
    },
  });

  if (error || !data?.url) {
    return { error: error?.message || "Unable to start Google sign-in." } as ActionState;
  }

  redirect(data.url);
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
