import Link from "next/link";
import { ArrowRight, Brain, TrendingUp, FileSearch, Users, CheckCircle2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Brain,
    title: "AI Resume Scoring",
    desc: "Gemini AI ranks every candidate against your JD in seconds — no manual screening needed.",
  },
  {
    icon: FileSearch,
    title: "Resume Intelligence",
    desc: "Parse PDFs, Word docs, and Drive files into structured candidate profiles instantly.",
  },
  {
    icon: TrendingUp,
    title: "Pipeline Analytics",
    desc: "Visualise candidate flow across every stage with live funnel metrics and heatmaps.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    desc: "Role-based access, shared pipelines, and audit trails — built for modern hiring teams.",
  },
];

const stats = [
  { value: "24k+", label: "Candidates Processed" },
  { value: "120+", label: "Active Roles Tracked" },
  { value: "9 days", label: "Avg. Time-to-Fill" },
  { value: "94%", label: "AI Match Accuracy" },
];

const highlights = [
  "AI Resume Scoring",
  "Google Drive Import",
  "Pipeline Analytics",
  "Team Collaboration",
  "Bulk Upload",
  "Structured Interviews",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-150 w-225 rounded-full bg-amber-500/8 blur-[120px]" />
        <div className="absolute top-1/2 -right-60 h-100 w-150 rounded-full bg-amber-600/5 blur-[100px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 border-b border-white/8 px-6 py-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500">
              <Zap className="h-4 w-4 text-slate-950" />
            </div>
            <span className="font-heading text-lg font-bold text-white">Dutient</span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              asChild
              variant="ghost"
              className="text-white/60 hover:bg-white/8 hover:text-white"
            >
              <Link href="/login">Sign In</Link>
            </Button>
            <Button
              asChild
              className="bg-amber-500 font-semibold text-slate-950 hover:bg-amber-400"
            >
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        {/* Hero */}
        <div className="flex flex-col items-center py-20 text-center lg:py-28">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-amber-500/10 px-4 py-1.5 text-sm font-medium text-amber-400">
            <Zap className="h-3.5 w-3.5" />
            AI-Powered Hiring Portal
          </div>

          <h1 className="mb-6 max-w-3xl text-5xl font-heading font-extrabold leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl">
            Hire the best.
            <span className="block text-amber-400">Hire faster.</span>
          </h1>

          <p className="mb-10 max-w-2xl text-lg leading-relaxed text-white/55">
            Dutient HRMS brings AI screening, resume intelligence, and pipeline management into
            one secure workspace — so your team can focus on people, not paperwork.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="bg-amber-500 px-8 text-base font-semibold text-slate-950 hover:bg-amber-400"
            >
              <Link href="/register">
                Start Hiring <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/20 bg-transparent px-8 text-base text-white hover:bg-white/8 hover:text-white"
            >
              <Link href="/login">Sign In to Portal</Link>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-20 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/8 bg-white/4 p-5 text-center backdrop-blur-sm"
            >
              <div className="mb-1 text-3xl font-bold text-amber-400">{stat.value}</div>
              <div className="text-sm text-white/45">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="mb-20 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group rounded-2xl border border-white/8 bg-white/4 p-6 transition-all duration-200 hover:border-amber-500/30 hover:bg-white/7"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/12 transition-colors group-hover:bg-amber-500/20">
                <Icon className="h-5 w-5 text-amber-400" />
              </div>
              <h3 className="mb-2 font-semibold text-white">{title}</h3>
              <p className="text-sm leading-relaxed text-white/45">{desc}</p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mb-16 rounded-3xl border border-amber-500/20 bg-linear-to-br from-amber-500/10 via-amber-600/5 to-transparent p-10 text-center lg:p-14">
          <h2 className="mb-3 text-3xl font-heading font-bold text-white">
            Ready to transform your hiring?
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-white/55">
            Built exclusively for the Dutient team. Sign up with your @dutient.ai email and
            get full access to all hiring tools.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            {highlights.map((item) => (
              <span key={item} className="inline-flex items-center gap-1.5 text-sm text-amber-400/80">
                <CheckCircle2 className="h-4 w-4" />
                {item}
              </span>
            ))}
          </div>
          <div className="mt-8">
            <Button
              asChild
              size="lg"
              className="bg-amber-500 px-10 font-semibold text-slate-950 hover:bg-amber-400"
            >
              <Link href="/register">Create your account</Link>
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/8 py-8 text-center text-sm text-white/30">
          © {new Date().getFullYear()} Dutient · AI-Powered Hiring Portal · Restricted to @dutient.ai accounts
        </div>
      </div>
    </div>
  );
}
