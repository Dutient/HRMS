import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { getCandidates } from "@/app/actions/get-candidates";
import { isSupabaseConfigured } from "@/lib/supabase";
import { SupabaseSetupBanner } from "@/components/candidates/supabase-setup-banner";
import { AISearchPanel } from "@/components/candidates/ai-search-panel";
import { CandidatesListClient } from "@/components/candidates/candidates-list-client";

export default async function CandidatesPage() {
  // Fetch all candidates from Supabase
  const allCandidates = await getCandidates();

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

      {/* AI Smart Search & Ranking */}
      <AISearchPanel />

      {/* Search Bar & Candidates Grid (Client Component) */}
      <CandidatesListClient candidates={allCandidates} />
    </div>
  );
}
