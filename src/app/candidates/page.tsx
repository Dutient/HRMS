import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Users, Search, Filter } from "lucide-react";
import { getCandidates } from "@/app/actions/get-candidates";
import { isSupabaseConfigured } from "@/lib/supabase";
import { CandidatesGrid } from "@/components/candidates/candidates-grid";
import { SupabaseSetupBanner } from "@/components/candidates/supabase-setup-banner";
import { AISearchPanel } from "@/components/candidates/ai-search-panel";

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

      {/* Search & Filter Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <Input
                placeholder="Search by name, role, or skills..."
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Candidates Grid */}
      <CandidatesGrid candidates={allCandidates} />
    </div>
  );
}
