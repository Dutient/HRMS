"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  Filter,
  Download,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Star,
  Users,
} from "lucide-react";
import type { Candidate } from "@/lib/supabase";
import { ScheduleDialog } from "@/components/interviews/schedule-dialog";

interface CandidatesListProps {
  candidates: Candidate[];
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    New: "bg-info/10 text-info",
    Screening: "bg-warning/10 text-warning",
    Interview: "bg-accent/10 text-accent",
    "Final Round": "bg-success/10 text-success",
    Selected: "bg-success text-white",
    Rejected: "bg-danger/10 text-danger",
    "Talent Pool": "bg-success/10 text-success",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getMatchScoreBadge = (score: number | null) => {
  // Always show badge, even for 0 or null
  let colorClass = "bg-danger/10 text-danger"; // < 60
  if (score !== null && score >= 80) {
    colorClass = "bg-success/10 text-success"; // >= 80
  } else if (score !== null && score >= 60) {
    colorClass = "bg-warning/10 text-warning"; // >= 60
  }
  const displayScore = score === null ? 0 : score;
  return (
    <Badge className={colorClass}>
      <Star className="h-3 w-3 mr-1 fill-current" />
      {displayScore}% Match
    </Badge>
  );
};

export function CandidatesList({ candidates }: CandidatesListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCandidates = candidates
    .filter((candidate) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        candidate.name.toLowerCase().includes(searchLower) ||
        candidate.email.toLowerCase().includes(searchLower) ||
        candidate.role.toLowerCase().includes(searchLower) ||
        candidate.skills.some((skill) => skill.toLowerCase().includes(searchLower))
      );
    })
    // No need to sort here, already sorted from backend
    ;

  return (
    <>
      {/* Filters */}
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
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      {filteredCandidates.length === 0 && (
        <Card className="p-12">
          <div className="text-center">
            <Users className="mx-auto h-16 w-16 text-text-muted mb-4" />
            <h3 className="font-heading text-xl font-semibold text-primary mb-2">
              {searchQuery ? "No candidates found" : "No candidates yet"}
            </h3>
            <p className="text-text-muted mb-4">
              {searchQuery
                ? "Try adjusting your search terms"
                : "Start by uploading resumes or adding candidates manually"}
            </p>
            {!searchQuery && (
              <Button className="bg-accent hover:bg-accent-hover">
                Add First Candidate
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Candidates List */}
      <div className="grid gap-4">
        {filteredCandidates.map((candidate) => (
          <Card key={candidate.id} className="transition-shadow hover:shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-start justify-between flex-col md:flex-row gap-4">
                {/* Left Section */}
                <div className="flex gap-4 flex-1">
                  <Avatar className="h-16 w-16 shrink-0">
                    <AvatarImage src={candidate.avatar_url || ""} />
                    <AvatarFallback className="bg-accent text-white font-semibold text-lg">
                      {candidate.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>

                  <div className="space-y-3 flex-1">
                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-heading text-xl font-semibold text-primary">
                          {candidate.name}
                        </h3>
                        <Badge className={getStatusColor(candidate.status)}>
                          {candidate.status}
                        </Badge>
                        {getMatchScoreBadge(candidate.match_score)}
                      </div>
                      <p className="text-base text-text-muted">{candidate.role}</p>
                    </div>

                    {/* Contact Info */}
                    <div className="flex flex-wrap gap-4 text-sm text-text-muted">
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-4 w-4" />
                        {candidate.email}
                      </div>
                      {candidate.phone && (
                        <div className="flex items-center gap-1.5">
                          <Phone className="h-4 w-4" />
                          {candidate.phone}
                        </div>
                      )}
                      {candidate.location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-4 w-4" />
                          {candidate.location}
                        </div>
                      )}
                      {candidate.experience && (
                        <div className="flex items-center gap-1.5">
                          <Briefcase className="h-4 w-4" />
                          {candidate.experience} years
                        </div>
                      )}
                    </div>

                    {/* Skills */}
                    {candidate.skills && candidate.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {candidate.skills.map((skill) => (
                          <Badge key={skill} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Meta Info */}
                    <div className="flex gap-4 text-xs text-text-muted flex-wrap">
                      <span>Applied: {formatDate(candidate.applied_date)}</span>
                      {candidate.source && (
                        <>
                          <span>•</span>
                          <span>Source: {candidate.source}</span>
                        </>
                      )}
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-accent text-accent" />
                          Match: {candidate.match_score === null ? 0 : candidate.match_score}%
                        </span>
                      </>
                    </div>
                  </div>
                </div>

                {/* Right Section - Actions */}
                <div className="flex flex-col gap-2 w-full md:w-auto">
                  <Button size="sm" className="bg-accent hover:bg-accent-hover">
                    View Profile
                  </Button>
                  <ScheduleDialog
                    candidateId={candidate.id}
                    candidateName={candidate.name}
                    trigger={
                      <Button size="sm" variant="outline">
                        Schedule Interview
                      </Button>
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
