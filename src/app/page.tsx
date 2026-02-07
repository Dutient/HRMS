import { Header } from "@/components/layout/Header";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto max-w-7xl px-6 py-16">
        {/* Hero Section */}
        <div className="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center text-center">
          <div className="mb-8 inline-block rounded-full bg-accent/10 px-6 py-2">
            <span className="text-sm font-semibold text-accent">
              Production-Grade ATS
            </span>
          </div>
          
          <h1 className="mb-6 font-heading text-6xl font-extrabold tracking-tight text-primary sm:text-7xl lg:text-8xl">
            Welcome to <span className="text-accent">Dutient</span>
          </h1>
          
          <p className="mb-12 max-w-2xl text-xl text-text-muted sm:text-2xl">
            Your next-generation HR Management System. Built to handle 1,500+ resumes 
            with powerful AI workflows and seamless candidate tracking.
          </p>
          
          <div className="flex flex-col gap-4 sm:flex-row">
            <button className="rounded-lg bg-accent px-8 py-4 font-semibold text-white shadow-lg transition-all hover:bg-accent-hover hover:-translate-y-0.5 hover:shadow-xl">
              Get Started
            </button>
            <button className="rounded-lg border-2 border-primary bg-transparent px-8 py-4 font-semibold text-primary transition-all hover:bg-primary hover:text-white">
              View Documentation
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-primary to-primary-light p-6 text-white shadow-lg transition-transform hover:-translate-y-1"
            >
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
              <div className="relative">
                <div className="mb-2 font-heading text-4xl font-extrabold">
                  {stat.value}
                </div>
                <div className="text-sm opacity-90">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Features Section */}
        <div className="mt-24">
          <h2 className="mb-12 text-center font-heading text-4xl font-bold text-primary">
            Powered by Modern Technology
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={index}
                className="rounded-xl bg-card p-8 shadow-md transition-shadow hover:shadow-xl"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                  <span className="text-2xl">{feature.icon}</span>
                </div>
                <h3 className="mb-3 font-heading text-xl font-semibold text-primary">
                  {feature.title}
                </h3>
                <p className="text-text-muted">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-24 border-t border-border bg-card py-8">
        <div className="container mx-auto max-w-7xl px-6 text-center text-sm text-text-muted">
          <p>© 2026 Dutient HR Management System. Built with Next.js 16 & TypeScript.</p>
        </div>
      </footer>
    </div>
  );
}

const stats = [
  { value: "1,500+", label: "Resumes Handled" },
  { value: "AI-Powered", label: "Smart Workflows" },
  { value: "Real-time", label: "Candidate Tracking" },
  { value: "Enterprise", label: "Production Ready" },
];

const features = [
  {
    icon: "⚡",
    title: "Next.js 16",
    description: "Built on the latest Next.js with App Router for optimal performance and developer experience",
  },
  {
    icon: "🎨",
    title: "shadcn/ui",
    description: "Beautiful, accessible components built with Radix UI and Tailwind CSS",
  },
  {
    icon: "🚀",
    title: "TypeScript",
    description: "Fully typed codebase for reliability and excellent developer tooling support",
  },
];

