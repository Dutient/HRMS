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
  ExternalLink,
  FileText,
} from "lucide-react";
import type { Candidate } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface CandidateCardProps {
  candidate: Candidate;
  isBestFit?: boolean;
}


import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

const getMatchScoreBadge = (score: number | null, justification?: string | null, isBestFit?: boolean) => {
  if (score === null || score === undefined) return null;

  let colorClass = "bg-warning/10 text-warning border-warning/20"; // 70-89
  const icon = <Star className={`h-3 w-3 mr-1 fill-current ${isBestFit ? "text-amber-500" : ""}`} />;

  if (score >= 90) {
    colorClass = "bg-success/10 text-success border-success/20"; // >= 90
  } else if (score < 70) {
    colorClass = "bg-gray-100 text-gray-600 border-gray-200"; // < 70
  }

  // Add glow if Best Fit
  const glowClass = isBestFit ? "shadow-[0_0_10px_rgba(251,191,36,0.5)] border-amber-400/50" : "";

  const badge = (
    <Badge className={`${colorClass} ${glowClass} cursor-help flex items-center gap-1`}>
      {icon}
      {score}% Match
      {justification && <Info className="h-3 w-3 ml-1 opacity-70" />}
    </Badge>
  );

  if (justification) {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            {badge}
          </TooltipTrigger>
          <TooltipContent className="max-w-xs text-sm bg-popover text-popover-foreground border-border p-3 shadow-md">
            <p className="font-semibold mb-1">AI Analysis:</p>
            <p>{justification}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return badge;
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

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export function CandidateCard({
  candidate,
  isBestFit,
}: CandidateCardProps) {
  const { toast } = useToast();

  const handleViewProfile = () => {
    if (!candidate.resume_url) {
      toast({
        title: "No resume available",
        description: "This candidate doesn't have a resume uploaded yet.",
        variant: "destructive",
      });
      return;
    }

    // Open resume in new tab
    window.open(candidate.resume_url, "_blank", "noopener,noreferrer");
  };

  const handleScheduleInterview = () => {
    const subject = encodeURIComponent(`Interview Invitation - ${candidate.role} Position`);
    const body = encodeURIComponent(
      `Dear ${candidate.name},\n\nWe are pleased to invite you for an interview for the ${candidate.role} position.\n\nPlease let us know your availability.\n\nBest regards,\nHR Team`
    );

    const mailtoLink = `mailto:${candidate.email}?subject=${subject}&body=${body}`;
    window.location.href = mailtoLink;
  };
  return (
    <Card className={`transition-all hover:shadow-lg relative overflow-hidden ${isBestFit ? "border-amber-400 border-2 shadow-md" : "hover:border-accent/40"}`}>
      {isBestFit && (
        <div className="absolute top-0 left-0 bg-amber-400 text-white text-[10px] font-bold px-2 py-1 rounded-br-lg flex items-center gap-1 z-10 shadow-sm">
          <Star className="h-3 w-3 fill-current" />
          BEST FIT
        </div>
      )}
      <CardContent className="p-5 space-y-4 pt-7">
        {/* Header */}
        <div className="flex items-start gap-3">
          <Avatar className={`h-12 w-12 border-2 ${isBestFit ? "border-amber-400" : "border-accent/20"}`}>
            <AvatarImage src={candidate.avatar_url || ""} />
            <AvatarFallback className={`${isBestFit ? "bg-amber-100 text-amber-700" : "bg-accent text-white"} font-semibold`}>
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
              {getMatchScoreBadge(candidate.match_score, (candidate as any).ai_justification, isBestFit)}
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
          {candidate.applied_date && (
            <div className="flex items-center gap-2 text-text-muted text-xs">
              <span>Applied: {formatDate(candidate.applied_date)}</span>
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
            onClick={handleViewProfile}
            disabled={!candidate.resume_url}
          >
            {candidate.resume_url ? (
              <>
                <FileText className="mr-2 h-4 w-4" />
                View Resume
                <ExternalLink className="ml-2 h-3 w-3" />
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                No Resume
              </>
            )}
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-accent hover:bg-accent-hover"
            onClick={handleScheduleInterview}
          >
            <Mail className="mr-2 h-4 w-4" />
            Schedule Interview
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
