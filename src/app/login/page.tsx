"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { startGoogleOAuth } from "@/app/actions/auth";
import { Zap, Brain, TrendingUp, Users } from "lucide-react";
import Link from "next/link";
import { use, useState, useTransition } from "react";

function LoginForm({ presetError }: { presetError?: string }) {
  "use client";

  const [oauthError, setOauthError] = useState<string | undefined>();
  const [isOauthPending, startOauth] = useTransition();
  const error = presetError || oauthError;

  return (
    <div className="space-y-4">
      <Button
        type="button"
        variant="outline"
        className="w-full border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
        size="lg"
        onClick={() => {
          startOauth(async () => {
            const res = await startGoogleOAuth();
            if (res?.error) setOauthError(res.error);
          });
        }}
        disabled={isOauthPending}
      >
        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        {isOauthPending ? "Redirecting to Google…" : "Continue with Google"}
      </Button>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <p className="text-center text-xs text-slate-400">
        Sign in with your @dutient.ai Google account
      </p>
    </div>
  );
}

export default function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; redirect?: string }>;
}) {
  const params = use(searchParams ?? Promise.resolve({} as { error?: string; redirect?: string }));
  const errorKey = params.error;
  const presetError =
    errorKey === "domain"
      ? "Please use your @dutient.ai email."
      : errorKey === "oauth"
        ? "Google sign-in failed. Please try again."
        : undefined;

  const features = [
    { icon: Brain, label: "AI Resume Scoring" },
    { icon: TrendingUp, label: "Pipeline Analytics" },
    { icon: Users, label: "Team Collaboration" },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ── Left Panel ── */}
      <div className="hidden lg:flex lg:w-[55%] flex-col bg-slate-900 px-12 py-10 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 -left-20 h-80 w-80 rounded-full bg-amber-500/12 blur-[90px]" />
          <div className="absolute bottom-10 right-10 h-64 w-64 rounded-full bg-amber-600/8 blur-[70px]" />
        </div>

        <Link href="/" className="relative z-10 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500">
            <Zap className="h-4.5 w-4.5 text-slate-950" />
          </div>
          <div className="leading-none">
            <span className="block font-heading text-[15px] font-bold text-white">Dutient</span>
            <span className="block text-[10px] tracking-widest text-amber-400/80 uppercase">HRMS</span>
          </div>
        </Link>

        <div className="relative z-10 flex flex-1 flex-col justify-center">
          <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-400">
            <Zap className="h-3 w-3" />
            AI-Powered Hiring Portal
          </div>
          <h1 className="mb-3 text-[38px] font-heading font-extrabold leading-[1.15] text-white">
            Your Hiring
            <span className="block text-amber-400">Command Centre</span>
          </h1>
          <p className="mb-7 max-w-sm text-[15px] leading-relaxed text-white/50">
            Source, screen, and hire top talent — all in one secure workspace powered by AI. Built exclusively for the Dutient team.
          </p>
          <div className="mb-6 flex flex-wrap gap-2">
            {features.map(({ icon: Icon, label }) => (
              <span key={label} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/65">
                <Icon className="h-3.5 w-3.5 text-amber-400" />
                {label}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {["Resume Parsing", "Google Drive", "Bulk Upload", "AI Ranking", "Interviews"].map((chip) => (
              <span key={chip} className="rounded-full border border-white/8 bg-slate-800/60 px-3 py-1 text-xs text-white/35">
                {chip}
              </span>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-[11px] text-white/25">
          © {new Date().getFullYear()} Dutient · Restricted to @dutient.ai accounts
        </p>
      </div>

      {/* ── Right Panel ── */}
      <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto bg-white px-6 py-10">
        <Link href="/" className="mb-8 flex items-center gap-2 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500">
            <Zap className="h-4 w-4 text-slate-950" />
          </div>
          <span className="font-heading text-lg font-bold text-slate-900">Dutient</span>
        </Link>

        <div className="w-full max-w-90">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10">
              <Zap className="h-6 w-6 text-amber-500" />
            </div>
            <h2 className="text-[22px] font-heading font-bold text-slate-900">Welcome back</h2>
            <p className="mt-1 text-sm text-slate-500">Sign in to your Dutient workspace</p>
          </div>

          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <LoginForm presetError={presetError} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
