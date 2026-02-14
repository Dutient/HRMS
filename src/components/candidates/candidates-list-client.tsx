"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Filter } from "lucide-react";
import { CandidatesGrid } from "@/components/candidates/candidates-grid";
import type { Candidate } from "@/lib/supabase";

interface CandidatesListClientProps {
  candidates: Candidate[];
}

export function CandidatesListClient({ candidates }: CandidatesListClientProps) {
  const [searchQuery, setSearchQuery] = useState("");

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

  return (
    <>
      {/* Search & Filter Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <Input
                placeholder="Search by name, role, or skills..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
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
    </>
  );
}
