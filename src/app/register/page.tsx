"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerWithPassword, startGoogleOAuth } from "@/app/actions/auth";
import { Zap, Brain, TrendingUp, Users, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { use, useEffect, useState, useTransition } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const initialState = {
  error: undefined as string | undefined,
  success: undefined as boolean | undefined,
  redirectTo: undefined as string | undefined,
};

function RegisterForm({ presetError, redirectPath }: { presetError?: string; redirectPath: string }) {
  "use client";

  const router = useRouter();
  const [state, formAction] = useActionState(registerWithPassword, initialState);
  const [oauthError, setOauthError] = useState<string | undefined>();
  const [isOauthPending, startOauth] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const error = state.error || presetError || oauthError;

  useEffect(() => {
    if (state.success) {
      toast.success("Account created!", {
        description: "Welcome to Dutient HRMS. Taking you to the dashboard…",
      });
      // Small delay so the toast renders before navigation
      const t = setTimeout(() => router.push(state.redirectTo || "/dashboard"), 1000);
      return () => clearTimeout(t);
    }
  }, [state.success, state.redirectTo, router]);

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

      <div className="flex items-center gap-3 text-xs text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        or register with email
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <form action={formAction} className="space-y-3">
        <input type="hidden" name="redirect" value={redirectPath} />
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-sm font-medium text-slate-700">Full Name (optional)</Label>
          <Input
            id="name"
            name="name"
            placeholder="Jane Cooper"
            className="border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:border-amber-500 focus-visible:ring-amber-500/20"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-medium text-slate-700">Company Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@dutient.ai"
            required
            className="border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:border-amber-500 focus-visible:ring-amber-500/20"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-sm font-medium text-slate-700">Password</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="At least 8 characters"
              required
              className="border-slate-200 bg-white pr-10 text-slate-900 placeholder:text-slate-400 focus-visible:border-amber-500 focus-visible:ring-amber-500/20"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirm" className="text-sm font-medium text-slate-700">Confirm Password</Label>
          <div className="relative">
            <Input
              id="confirm"
              name="confirm"
              type={showConfirm ? "text" : "password"}
              placeholder="Re-enter password"
              required
              className="border-slate-200 bg-white pr-10 text-slate-900 placeholder:text-slate-400 focus-visible:border-amber-500 focus-visible:ring-amber-500/20"
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              tabIndex={-1}
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}
        <Button
          type="submit"
          className="w-full bg-amber-500 font-semibold text-slate-950 hover:bg-amber-400"
          size="lg"
        >
          Create Account
        </Button>
      </form>

      <p className="text-center text-xs text-slate-400">
        Protected by enterprise-grade security · SOC 2 compliant
      </p>
      <p className="text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-amber-500 hover:text-amber-600">Sign in</Link>
      </p>
    </div>
  );
}

export default function RegisterPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; redirect?: string }>;
}) {
  const params = use(searchParams ?? Promise.resolve({} as { error?: string; redirect?: string }));
  const presetError =
    params.error === "domain" ? "Please use your @dutient.ai email." : undefined;
  const redirectPath = params.redirect || "/dashboard";

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
            Start hiring
            <span className="block text-amber-400">smarter today.</span>
          </h1>
          <p className="mb-7 max-w-sm text-[15px] leading-relaxed text-white/50">
            Join the Dutient team workspace. Get AI screening, resume intelligence, and full pipeline analytics — all in one place.
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
            <h2 className="text-[22px] font-heading font-bold text-slate-900">Create your account</h2>
            <p className="mt-1 text-sm text-slate-500">Join the Dutient hiring portal</p>
          </div>

          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <RegisterForm presetError={presetError} redirectPath={redirectPath} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
