"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Mail,
  Phone,
  Briefcase,
  Star,
  Linkedin,
  Upload,
  Globe,
  UserPlus,
} from "lucide-react";
import type { Candidate } from "@/lib/supabase";

interface CandidateCardProps {
  candidate: Candidate;
  onViewProfile?: (id: string) => void;
  onScheduleInterview?: (id: string) => void;
}

const getMatchScoreBadge = (score: number | null) => {
  if (!score) return null;

  let colorClass = "bg-warning/10 text-warning border-warning/20"; // 70-89
  const icon = <Star className="h-3 w-3 mr-1 fill-current" />;

  if (score >= 90) {
    colorClass = "bg-success/10 text-success border-success/20"; // >= 90
  } else if (score < 70) {
    colorClass = "bg-gray-100 text-gray-600 border-gray-200"; // < 70
  }

  return (
    <Badge className={colorClass}>
      {icon}
      {score}% Match
    </Badge>
  );
};

const getSourceIcon = (source: string | null) => {
  if (!source) return <Globe className="h-3.5 w-3.5" />;

  const sourceMap: Record<string, typeof Linkedin> = {
    LinkedIn: Linkedin,
    "Bulk Upload": Upload,
    Referral: UserPlus,
    Indeed: Globe,
  };

  const IconComponent = sourceMap[source] || Globe;
  return <IconComponent className="h-3.5 w-3.5" />;
};

export function CandidateCard({
  candidate,
  onViewProfile,
  onScheduleInterview,
}: CandidateCardProps) {
  return (
    <Card className="transition-all hover:shadow-lg hover:border-accent/40">
      <CardContent className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12 border-2 border-accent/20">
            <AvatarImage src={candidate.avatar_url || ""} />
            <AvatarFallback className="bg-accent text-white font-semibold">
              {candidate.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="font-heading text-lg font-semibold text-primary truncate">
                  {candidate.name}
                </h3>
                <p className="text-sm text-text-muted truncate">
                  {candidate.role}
                </p>
              </div>
              {getMatchScoreBadge(candidate.match_score)}
            </div>

            {/* Source Badge */}
            {candidate.source && (
              <div className="flex items-center gap-1.5 mt-2 text-xs text-text-muted">
                {getSourceIcon(candidate.source)}
                <span>via {candidate.source}</span>
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-text-muted">
            <Mail className="h-4 w-4 shrink-0" />
            <span className="truncate">{candidate.email}</span>
          </div>
          {candidate.phone && (
            <div className="flex items-center gap-2 text-text-muted">
              <Phone className="h-4 w-4 shrink-0" />
              <span>{candidate.phone}</span>
            </div>
          )}
          {candidate.experience !== null && (
            <div className="flex items-center gap-2 text-text-muted">
              <Briefcase className="h-4 w-4 shrink-0" />
              <span>{candidate.experience} years experience</span>
            </div>
          )}
        </div>

        {/* Skills Tags */}
        {candidate.skills && candidate.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {candidate.skills.slice(0, 5).map((skill) => (
              <Badge
                key={skill}
                variant="secondary"
                className="text-xs px-2 py-0.5"
              >
                {skill}
              </Badge>
            ))}
            {candidate.skills.length > 5 && (
              <Badge
                variant="secondary"
                className="text-xs px-2 py-0.5 bg-gray-100"
              >
                +{candidate.skills.length - 5} more
              </Badge>
            )}
          </div>
        )}

        {/* Footer - Actions */}
        <div className="flex gap-2 pt-2 border-t border-border">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => onViewProfile?.(candidate.id)}
          >
            View Profile
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-accent hover:bg-accent-hover"
            onClick={() => onScheduleInterview?.(candidate.id)}
          >
            Schedule Interview
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
