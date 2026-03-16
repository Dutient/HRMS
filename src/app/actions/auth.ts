"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type ActionState = { error?: string; success?: boolean; redirectTo?: string };

const allowedDomain = process.env.NEXT_PUBLIC_ALLOWED_DOMAIN || "dutient.ai";
const getSiteUrl = () => {
  const url = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL;
  if (url?.startsWith("http")) return url;
  if (url) return `https://${url}`;
  return "http://localhost:3000";
};

const isDomainAllowed = (email: string) => email.toLowerCase().endsWith(`@${allowedDomain}`);

export async function loginWithPassword(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const email = (formData.get("email") || "").toString().trim().toLowerCase();
  const password = (formData.get("password") || "").toString();
  const redirectTo = (formData.get("redirect") || "/dashboard").toString();

  const safeRedirect = redirectTo.startsWith("/") ? redirectTo : "/dashboard";

  if (!email || !password) return { error: "Email and password are required." };
  if (!isDomainAllowed(email)) return { error: `Use your @${allowedDomain} email to sign in.` };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: error.message };

  return { success: true, redirectTo: safeRedirect || "/dashboard" };
}

export async function registerWithPassword(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const email = (formData.get("email") || "").toString().trim().toLowerCase();
  const password = (formData.get("password") || "").toString();
  const confirm = (formData.get("confirm") || "").toString();
  const fullName = (formData.get("name") || "").toString().trim();
  const redirectTo = (formData.get("redirect") || "/dashboard").toString();

  const safeRedirect = redirectTo.startsWith("/") ? redirectTo : "/dashboard";

  if (!email || !password) return { error: "Email and password are required." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };
  if (password !== confirm) return { error: "Passwords do not match." };
  if (!isDomainAllowed(email)) return { error: `Only @${allowedDomain} emails can register.` };

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${getSiteUrl()}/auth/callback`,
      data: fullName ? { full_name: fullName } : undefined,
    },
  });

  if (error) return { error: error.message };

  return { success: true, redirectTo: safeRedirect || "/dashboard" };
}

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
