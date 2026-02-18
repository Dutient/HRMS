import { Badge } from "@/components/ui/badge";
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
    position: typeof params.position === 'string' ? params.position : undefined,
    job_opening: typeof params.job_opening === 'string' ? params.job_opening : undefined,
    domain: typeof params.domain === 'string' ? params.domain : undefined,
  };

  // Fetch all candidates from Supabase with filters
  const allCandidates = await getCandidates(undefined, filters);

  // Fetch filter options
  const filterOptions = await getFilterOptions();

  return (
    <div className="space-y-6">
      {/* Supabase Setup Warning */}
      {!isSupabaseConfigured && <SupabaseSetupBanner />}

      {/* Page Header */}
      <div className="flex items-center justify-between flex-col md:flex-row gap-4">
        <div>
          <h1 className="font-heading text-4xl font-bold text-primary">
            All Candidates
          </h1>
          <p className="mt-2 text-text-muted">
            Browse, search, and manage all candidate profiles
          </p>
        </div>
        <Badge variant="secondary" className="text-base px-4 py-2">
          <Users className="mr-2 h-4 w-4" />
          {allCandidates.length} Candidate{allCandidates.length !== 1 ? 's' : ''}
        </Badge>
      </div>



      {/* Search Bar & Candidates Grid (Client Component) */}
      <CandidatesListClient
        candidates={allCandidates}
        filters={filters}
        options={filterOptions}
      />
    </div>
  );
}
