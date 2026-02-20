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
import { ExperienceSlider, RelocationToggle } from "@/components/candidates/filter-components";

import { RankingModal } from "@/components/candidates/ranking-modal";
import { rankCandidates } from "@/app/actions/rank-candidates";
import { Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CandidatesListClientProps {
  candidates: Candidate[];
  filters?: {
    position?: string;
    job_opening?: string;
    domain?: string;
    location?: string;
    min_exp?: string;
    max_exp?: string;
    relocate?: string;
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

  // Handle filter change — works for both legacy (position/job_opening/domain) and new filters
  const handleFilterChange = (key: string, value: string) => {
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

  // ── New Filter Handlers ────────────────────────────────────────────────────
  const handleExperienceChange = (min: number, max: number) => {
    const params = new URLSearchParams(searchParams);
    if (min > 0) params.set("min_exp", String(min));
    else params.delete("min_exp");
    if (max < 30) params.set("max_exp", String(max));
    else params.delete("max_exp");
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleRelocationToggle = (checked: boolean) => {
    handleFilterChange("relocate", checked ? "true" : "");
  };

  const hasActiveFilters =
    filters?.position ||
    filters?.job_opening ||
    filters?.domain ||
    filters?.min_exp ||
    filters?.max_exp ||
    filters?.relocate;

  // Filter candidates based on search query (client-side text search)
  const filteredCandidates = useMemo(() => {
    if (!searchQuery.trim()) {
      return candidates;
    }

    const query = searchQuery.toLowerCase();
    return candidates.filter((candidate) => {
      if (candidate.name?.toLowerCase().includes(query)) return true;
      if (candidate.role?.toLowerCase().includes(query)) return true;
      if (candidate.skills?.some((skill) => skill.toLowerCase().includes(query))) return true;
      if (candidate.email?.toLowerCase().includes(query)) return true;
      if (candidate.location?.toLowerCase().includes(query)) return true;
      return false;
    });
  }, [candidates, searchQuery]);

  const handleRankCandidates = async (jobDescription: string) => {
    setIsRanking(true);
    try {
      const candidateIds = filteredCandidates.map(c => c.id);
      const result = await rankCandidates(jobDescription, candidateIds);

      if (result.success) {
        toast({
          title: "Ranking Complete ✅",
          description: `Scored ${result.results?.length ?? 0} of ${candidateIds.length} candidates. Grid is now sorted by best fit.`,
        });
        router.refresh();
        setIsRankingModalOpen(false);
      } else {
        toast({
          title: "Ranking Failed",
          description: result.message || "An error occurred. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Ranking error:", error);
      toast({
        title: "Ranking Failed",
        description: "An unexpected error occurred. Please try again.",
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
        <CardContent className="pt-4 pb-4">
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

          {/* ── Advanced Filters Row ── */}
          <div className="mt-3 border-t pt-3 flex flex-wrap items-end gap-4">
            <ExperienceSlider
              min={filters?.min_exp ? Number(filters.min_exp) : 0}
              max={filters?.max_exp ? Number(filters.max_exp) : 30}
              onChange={handleExperienceChange}
            />
            <RelocationToggle
              checked={filters?.relocate === "true"}
              onChange={handleRelocationToggle}
            />
          </div>

          {/* ── Legacy Filters (Position / Job / Domain) ── */}
          <div className="mt-3 border-t pt-3">
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
