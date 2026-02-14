"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Filter } from "lucide-react";
import { CandidatesGrid } from "@/components/candidates/candidates-grid";
import type { Candidate } from "@/lib/supabase";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";

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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Handle filter change
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

          <div className="flex flex-wrap gap-4 mt-4">
            <Select
              value={filters?.position || "all"}
              onValueChange={(val) => handleFilterChange("position", val)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Positions</SelectItem>
                {options?.positions && options.positions.length > 0 ? (
                  options.positions.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))
                ) : (
                  <div className="px-2 py-2 text-sm text-muted-foreground">No positions available</div>
                )}
              </SelectContent>
            </Select>

            <Select
              value={filters?.job_opening || "all"}
              onValueChange={(val) => handleFilterChange("job_opening", val)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Job Opening" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Jobs</SelectItem>
                {options?.jobOpenings && options.jobOpenings.length > 0 ? (
                  options.jobOpenings.map((j) => (
                    <SelectItem key={j} value={j}>
                      {j}
                    </SelectItem>
                  ))
                ) : (
                  <div className="px-2 py-2 text-sm text-muted-foreground">No jobs available</div>
                )}
              </SelectContent>
            </Select>

            <Select
              value={filters?.domain || "all"}
              onValueChange={(val) => handleFilterChange("domain", val)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Domain" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Domains</SelectItem>
                {options?.domains && options.domains.length > 0 ? (
                  options.domains.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))
                ) : (
                  <div className="px-2 py-2 text-sm text-muted-foreground">No domains available</div>
                )}
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button variant="ghost" onClick={clearFilters} className="text-text-muted hover:text-primary">
                <X className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            )}
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
