"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Star,
  Users,
} from "lucide-react";
import type { Candidate } from "@/lib/supabase";
import { ScheduleDialog } from "@/components/interviews/schedule-dialog";

interface TalentPoolListProps {
  candidates: Candidate[];
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getMatchScoreBadge = (score: number | null) => {
  if (!score) return null;

  let colorClass = "bg-danger/10 text-danger"; // < 60
  if (score >= 80) {
    colorClass = "bg-success/10 text-success"; // >= 80
  } else if (score >= 60) {
    colorClass = "bg-warning/10 text-warning"; // >= 60
  }

  return (
    <Badge className={colorClass}>
      <Star className="h-3 w-3 mr-1 fill-current" />
      {score}% Match
    </Badge>
  );
};

export function TalentPoolList({ candidates }: TalentPoolListProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-col md:flex-row gap-4">
          <div>
            <CardTitle className="font-heading text-2xl">
              Ready-to-Deploy Talent Pool
            </CardTitle>
            <CardDescription>
              Pre-vetted candidates available for immediate hiring
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-3xl font-extrabold text-success font-heading">
              {candidates.length}/6
            </div>
            <p className="text-sm text-text-muted">Target: 6 minimum</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Empty State */}
        {candidates.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-16 w-16 text-text-muted mb-4" />
            <h3 className="font-heading text-xl font-semibold text-primary mb-2">
              No talent pool candidates yet
            </h3>
            <p className="text-text-muted mb-4">
              Move candidates to the talent pool to keep them ready for immediate deployment
            </p>
            <Button className="bg-success hover:bg-success/90">
              Browse All Candidates
            </Button>
          </div>
        )}

        {/* Talent Pool Cards */}
        {candidates.map((candidate) => (
          <Card key={candidate.id} className="border-success/20 bg-success/5">
            <CardContent className="p-6">
              <div className="flex items-start justify-between flex-col md:flex-row gap-4">
                <div className="flex gap-4 flex-1">
                  <Avatar className="h-16 w-16 border-2 border-success shrink-0">
                    <AvatarImage src={candidate.avatar_url || ""} />
                    <AvatarFallback className="bg-success text-white font-semibold text-lg">
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
                        <Badge className="bg-success text-white">
                          Ready to Deploy
                        </Badge>
                        {getMatchScoreBadge(candidate.match_score)}
                        {candidate.rating && (
                          <div className="flex items-center gap-1 text-sm text-warning">
                            <Star className="h-4 w-4 fill-warning" />
                            <span className="font-semibold">{candidate.rating}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-base text-text-muted">{candidate.role}</p>
                    </div>

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

                    {candidate.skills && candidate.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {candidate.skills.map((skill) => (
                          <Badge key={skill} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {candidate.last_engaged && (
                      <p className="text-xs text-text-muted">
                        Last engaged: {formatDate(candidate.last_engaged)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 w-full md:w-auto">
                  <Button size="sm" className="bg-success hover:bg-success/90">
                    Deploy Now
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
      </CardContent>
    </Card>
  );
}
