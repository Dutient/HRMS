"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Filter } from "lucide-react";
import { CandidatesGrid } from "@/components/candidates/candidates-grid";
import type { Candidate } from "@/lib/supabase";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { FilterBar } from "@/components/candidates/filter-bar";

import { RankingModal } from "@/components/candidates/ranking-modal";
import { matchCandidates } from "@/app/actions/matchCandidates";
import { Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CandidatesListClientProps {
  candidates: Candidate[];
  filters?: {
    position?: string;
    job_opening?: string;
    domain?: string;
  };
  options?: {
    positions: string[];
    jobOpenings: string[];
    domains: string[];
  };
}

export function CandidatesListClient({ candidates, filters, options }: CandidatesListClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isRankingModalOpen, setIsRankingModalOpen] = useState(false);
  const [isRanking, setIsRanking] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // Handle filter change
  const handleFilterChange = (key: string, value: string) => {
    // ... existing logic ...
    const params = new URLSearchParams(searchParams);
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  // Clear all filters
  const clearFilters = () => {
    router.replace(pathname);
  };

  const hasActiveFilters = filters?.position || filters?.job_opening || filters?.domain;

  // Filter candidates based on search query
  const filteredCandidates = useMemo(() => {
    if (!searchQuery.trim()) {
      return candidates;
    }

    const query = searchQuery.toLowerCase();
    return candidates.filter((candidate) => {
      // Search in name
      if (candidate.name?.toLowerCase().includes(query)) return true;

      // Search in role
      if (candidate.role?.toLowerCase().includes(query)) return true;

      // Search in skills
      if (candidate.skills?.some((skill) => skill.toLowerCase().includes(query))) return true;

      // Search in email
      if (candidate.email?.toLowerCase().includes(query)) return true;

      // Search in location
      if (candidate.location?.toLowerCase().includes(query)) return true;

      return false;
    });
  }, [candidates, searchQuery]);

  const handleRankCandidates = async (jobDescription: string) => {
    setIsRanking(true);
    try {
      // Get IDs of currently filtered candidates
      const candidateIds = filteredCandidates.map(c => c.id);

      console.log(`Ranking ${candidateIds.length} candidates...`);

      // Call server action
      await matchCandidates(jobDescription, candidateIds);

      toast({
        title: "Ranking Complete",
        description: `Successfully ranked ${candidateIds.length} candidates based on relevance.`,
      });

      // Refresh to show updated scores
      router.refresh();
      setIsRankingModalOpen(false);
    } catch (error) {
      console.error("Ranking error:", error);
      toast({
        title: "Ranking Failed",
        description: "An error occurred while ranking candidates. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRanking(false);
    }
  };

  return (
    <>
      {/* Search & Filter Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-3 justify-between">
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <Input
                placeholder="Search by name, role, or skills..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button
                className="bg-purple-600 hover:bg-purple-700 text-white"
                onClick={() => setIsRankingModalOpen(true)}
                disabled={filteredCandidates.length === 0}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Rank Candidates
              </Button>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </div>
          </div>

          <div className="mt-6 border-t pt-4">
            <FilterBar
              filters={{
                position: filters?.position,
                job_opening: filters?.job_opening,
                domain: filters?.domain
              }}
              options={{
                positions: options?.positions || [],
                jobOpenings: options?.jobOpenings || [],
                domains: options?.domains || []
              }}
              onFilterChange={handleFilterChange}
              onClearFilters={clearFilters}
            />
          </div>
          {searchQuery && (
            <p className="text-sm text-text-muted mt-3">
              Found {filteredCandidates.length} of {candidates.length} candidates
            </p>
          )}
        </CardContent>
      </Card>

      {/* Candidates Grid */}
      <CandidatesGrid candidates={filteredCandidates} />

      <RankingModal
        open={isRankingModalOpen}
        onOpenChange={setIsRankingModalOpen}
        onRank={handleRankCandidates}
        loading={isRanking}
        count={filteredCandidates.length}
      />
    </>
  );
}
