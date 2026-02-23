import { Users } from "lucide-react";
import { getCandidates, getFilterOptions } from "@/app/actions/get-candidates";
import { isSupabaseConfigured } from "@/lib/supabase";
import { SupabaseSetupBanner } from "@/components/candidates/supabase-setup-banner";
import { CandidatesListClient } from "@/components/candidates/candidates-list-client";

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CandidatesPage({ searchParams }: Props) {
  const params = await searchParams;

  const filters = {
    position: typeof params.position === "string" ? params.position : undefined,
    job_opening: typeof params.job_opening === "string" ? params.job_opening : undefined,
    domain: typeof params.domain === "string" ? params.domain : undefined,
    location: typeof params.location === "string" ? params.location : undefined,
    min_exp: typeof params.min_exp === "string" ? params.min_exp : undefined,
    max_exp: typeof params.max_exp === "string" ? params.max_exp : undefined,
    relocate: typeof params.relocate === "string" ? params.relocate : undefined,
  };

  const allCandidates = await getCandidates(undefined, filters);
  const filterOptions = await getFilterOptions();

  return (
    <div className="space-y-6">
      {!isSupabaseConfigured && <SupabaseSetupBanner />}

      {/* Page Header */}
      <div className="relative overflow-hidden rounded-[--radius-lg] bg-primary px-6 py-8">
        {/* Decorative accent bar */}
        <div className="absolute left-0 top-0 h-full w-1 bg-accent" />

        {/* Background pattern — subtle dots */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-accent">
              Talent Pool
            </p>
            <h1 className="font-heading text-3xl font-bold text-white">
              All Candidates
            </h1>
            <p className="mt-1 text-sm text-white/50">
              Browse, search, and manage all candidate profiles
            </p>
          </div>

          {/* Count pill */}
          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 backdrop-blur-sm">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent">
                <Users className="h-3.5 w-3.5 text-primary" />
              </span>
              <span className="text-sm font-semibold text-white">
                {allCandidates.length}{" "}
                <span className="font-normal text-white/60">
                  Candidate{allCandidates.length !== 1 ? "s" : ""}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar & Candidates Grid */}
      <CandidatesListClient
        candidates={allCandidates}
        filters={filters}
        options={filterOptions}
      />
    </div>
  );
}